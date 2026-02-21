import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";

admin.initializeApp();

// App Check helper: validates the request has a valid App Check token
function validateAppCheck(request: { app?: { appId?: string } }): void {
  // If App Check is enforced and the request doesn't have a valid token, reject it
  if (!request.app) {
    throw new HttpsError(
      "failed-precondition",
      "App Check Token fehlt. Bitte lade die Seite neu."
    );
  }
}

const db = admin.firestore();

// Input-Sanitierung: Laenge begrenzen und nur erlaubte Zeichen
const MAX_TOPIC_LENGTH = 200;
const MAX_NOTES_LENGTH = 500;
const MAX_PROMPT_LENGTH = 500;

function sanitizeTextInput(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  return input.slice(0, maxLength).trim();
}

// Rollen-Check: Nur Trainer/Admin duerfen KI-Functions aufrufen
async function requireTrainerRole(userId: string): Promise<void> {
  const userDoc = await db.collection("users").doc(userId).get();
  const role = userDoc.data()?.role;
  if (!role || !["admin", "trainer"].includes(role)) {
    throw new HttpsError(
      "permission-denied",
      "Nur Trainer und Admins koennen diese Funktion nutzen."
    );
  }
}

// Rate limiting: max 10 requests per user per hour
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface SessionPhase {
  title: string;
  duration: string;
  exercises: {
    title: string;
    duration: string;
    repetitions?: string;
    description: string;
    kneeAlternative?: string;
    shoulderAlternative?: string;
  }[];
}

interface GeneratedSession {
  title: string;
  description: string;
  duration: string;
  focus: string;
  category: string;
  phases: SessionPhase[];
}

interface ExerciseSuggestion {
  title: string;
  reason: string;
  matchScore: number;
}

// Model configuration with fallback
// Gemini 3 Flash has free tier, 2.5 Flash as fallback
const MODELS = {
  primary: "gemini-3-flash-preview",
  fallback: "gemini-2.5-flash",
};

// Generate content with automatic fallback from Pro to Flash
async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  prompt: string,
  config: { temperature: number; maxOutputTokens: number }
): Promise<{ text: string; model: string }> {
  // Try Pro first
  try {
    const proModel = genAI.getGenerativeModel({
      model: MODELS.primary,
      generationConfig: config,
    });
    const result = await proModel.generateContent(prompt);
    return { text: result.response.text(), model: MODELS.primary };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Check if rate limited (429) or quota exceeded
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      console.log("Pro model rate limited, falling back to Flash");
      // Fallback to Flash
      const flashModel = genAI.getGenerativeModel({
        model: MODELS.fallback,
        generationConfig: config,
      });
      const result = await flashModel.generateContent(prompt);
      return { text: result.response.text(), model: MODELS.fallback };
    }
    throw error;
  }
}

// Check rate limit with transaction to prevent race conditions
async function checkRateLimit(userId: string): Promise<boolean> {
  const rateLimitRef = db.collection("rateLimits").doc(userId);
  const now = Date.now();

  try {
    return await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      const data = doc.data();

      // Filter requests within the window
      const recentRequests = data
        ? (data.requests as number[]).filter(
            (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
          )
        : [];

      if (recentRequests.length >= RATE_LIMIT_REQUESTS) {
        return false;
      }

      // Add new request atomically
      transaction.set(rateLimitRef, { requests: [...recentRequests, now] });
      return true;
    });
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Finding 9: Fail-Closed - bei Fehler Request ablehnen (schuetzt KI-Budget)
    return false;
  }
}

// Generate a complete training session
export const generateSession = onCall(
  {
    region: "europe-west1",
    maxInstances: 5,
    secrets: ["GEMINI_API_KEY"],
    // Enforce App Check - requests without valid tokens will be rejected
    enforceAppCheck: true,
  },
  async (request) => {
    validateAppCheck(request);

    // Auth check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anmeldung erforderlich");
    }

    const userId = request.auth.uid;

    // Finding 1: Rollen-Check - nur Trainer/Admin
    await requireTrainerRole(userId);

    // Rate limit check
    const allowed = await checkRateLimit(userId);
    if (!allowed) {
      throw new HttpsError(
        "resource-exhausted",
        "Rate-Limit erreicht. Bitte warte eine Stunde."
      );
    }

    const { category, exercises } = request.data;

    // Finding 7: Input-Sanitierung gegen Prompt Injection
    const topic = sanitizeTextInput(request.data.topic, MAX_TOPIC_LENGTH);
    const difficulty = sanitizeTextInput(request.data.difficulty, 50);
    const additionalNotes = sanitizeTextInput(request.data.additionalNotes, MAX_NOTES_LENGTH);

    if (!topic) {
      throw new HttpsError("invalid-argument", "Thema ist erforderlich");
    }

    // Get API key from secret
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError("internal", "API-Konfiguration fehlt");
    }

    // Load session rules from config
    let sessionRules = {
      totalDuration: 45,
      phases: [
        { name: "Aufwärmen", duration: 10, minExercises: 3, maxExercises: 5 },
        { name: "Hauptteil", duration: 15, minExercises: 4, maxExercises: 6 },
        { name: "Schwerpunkt", duration: 15, minExercises: 3, maxExercises: 5 },
        { name: "Ausklang", duration: 5, minExercises: 2, maxExercises: 4 },
      ],
    };

    try {
      const configDoc = await db.collection("config").doc("sessionRules").get();
      if (configDoc.exists) {
        const data = configDoc.data();
        if (data) {
          sessionRules = {
            totalDuration: data.totalDuration || 45,
            phases: data.phases || sessionRules.phases,
          };
        }
      }
    } catch (e) {
      console.log("Using default session rules");
    }

    // Build the prompt
    const exerciseList =
      exercises && exercises.length > 0
        ? `\n\nVerfügbare Übungen aus der Bibliothek:\n${exercises
            .map(
              (e: { title: string; area?: string; difficulty?: string }) =>
                `- ${e.title} (${e.area || "Ganzkörper"}, ${e.difficulty || "Mittel"})`
            )
            .join("\n")}`
        : "";

    const prompt = `Du bist ein erfahrener Rehasport-Trainer. Erstelle eine ${sessionRules.totalDuration}-Minuten Trainingsstunde zum Thema "${topic}".

Schwierigkeit: ${difficulty || "mittel"}
${additionalNotes ? `Besondere Wünsche: ${additionalNotes}` : ""}
${exerciseList}

Die Stunde muss folgende Phasen haben:
${sessionRules.phases.map((p) => `- ${p.name}: ${p.duration} Minuten (${p.minExercises}-${p.maxExercises} Übungen)`).join("\n")}

Für jede Übung gib an:
- Titel (kurz, prägnant)
- Dauer/Wiederholungen
- Kurze Beschreibung der Ausführung
- Alternative bei Knieproblemen (falls relevant)
- Alternative bei Schulterproblemen (falls relevant)

Antworte NUR mit validem JSON im folgenden Format:
{
  "title": "Titel der Stunde",
  "description": "Kurze Beschreibung (1-2 Sätze)",
  "focus": "Hauptfokus der Stunde",
  "phases": [
    {
      "title": "Phasenname",
      "duration": "X Minuten",
      "exercises": [
        {
          "title": "Übungsname",
          "duration": "X Minuten" oder "Xmal wiederholen",
          "description": "Ausführungsbeschreibung",
          "kneeAlternative": "Alternative bei Knieproblemen (optional)",
          "shoulderAlternative": "Alternative bei Schulterproblemen (optional)"
        }
      ]
    }
  ]
}`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const { text, model: usedModel } = await generateWithFallback(genAI, prompt, {
        temperature: 0.7,
        maxOutputTokens: 4096,
      });

      console.log(`Generated session using ${usedModel}`);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Keine gültige JSON-Antwort erhalten");
      }

      const sessionData = JSON.parse(jsonMatch[0]) as GeneratedSession;
      sessionData.category = category || topic;
      sessionData.duration = `${sessionRules.totalDuration} Minuten`;

      return {
        success: true,
        session: sessionData,
        model: usedModel, // Return which model was used
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new HttpsError(
        "internal",
        "KI-Generierung fehlgeschlagen. Bitte versuche es erneut."
      );
    }
  }
);

// Suggest exercises based on criteria
export const suggestExercises = onCall(
  {
    region: "europe-west1",
    maxInstances: 5,
    secrets: ["GEMINI_API_KEY"],
    // Enforce App Check - requests without valid tokens will be rejected
    enforceAppCheck: true,
  },
  async (request) => {
    validateAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anmeldung erforderlich");
    }

    const userId = request.auth.uid;

    // Finding 1: Rollen-Check
    await requireTrainerRole(userId);

    const allowed = await checkRateLimit(userId);
    if (!allowed) {
      throw new HttpsError(
        "resource-exhausted",
        "Rate-Limit erreicht. Bitte warte eine Stunde."
      );
    }

    const { exercises } = request.data;

    // Finding 7: Input-Sanitierung
    const topic = sanitizeTextInput(request.data.topic, MAX_TOPIC_LENGTH);
    const difficulty = sanitizeTextInput(request.data.difficulty, 50);
    const additionalNotes = sanitizeTextInput(request.data.additionalNotes, MAX_NOTES_LENGTH);

    if (!topic || !exercises || exercises.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Thema und Übungsliste erforderlich"
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError("internal", "API-Konfiguration fehlt");
    }

    const exerciseList = exercises
      .map(
        (e: {
          title: string;
          area?: string;
          focus?: string;
          difficulty?: string;
          summary?: string;
        }) =>
          `- ${e.title}: ${e.summary || ""} (Bereich: ${e.area || "Ganzkörper"}, Fokus: ${e.focus || ""}, Schwierigkeit: ${e.difficulty || "Mittel"})`
      )
      .join("\n");

    const prompt = `Du bist ein erfahrener Rehasport-Trainer. Wähle die besten Übungen für das Thema "${topic}" aus.

Schwierigkeit: ${difficulty || "mittel"}
${additionalNotes ? `Besondere Wünsche: ${additionalNotes}` : ""}

Verfügbare Übungen:
${exerciseList}

Wähle 8-12 Übungen aus, die am besten zum Thema passen. Erkläre kurz warum.

Antworte NUR mit validem JSON:
{
  "suggestions": [
    {
      "title": "Exakter Übungsname aus der Liste",
      "reason": "Kurze Begründung",
      "matchScore": 85
    }
  ]
}`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const { text, model: usedModel } = await generateWithFallback(genAI, prompt, {
        temperature: 0.5,
        maxOutputTokens: 2048,
      });

      console.log(`Generated suggestions using ${usedModel}`);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Keine gültige JSON-Antwort erhalten");
      }

      const data = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        suggestions: data.suggestions as ExerciseSuggestion[],
        model: usedModel, // Return which model was used
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new HttpsError(
        "internal",
        "KI-Vorschläge fehlgeschlagen. Bitte versuche es erneut."
      );
    }
  }
);

// Get rate limit status for current user
export const getRateLimitStatus = onCall(
  {
    region: "europe-west1",
    maxInstances: 10,
    enforceAppCheck: true,
  },
  async (request) => {
    validateAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anmeldung erforderlich");
    }

    const userId = request.auth.uid;
    const now = Date.now();

    const rateLimitRef = db.collection("rateLimits").doc(userId);
    const doc = await rateLimitRef.get();
    const data = doc.data();

    if (!data) {
      return {
        used: 0,
        remaining: RATE_LIMIT_REQUESTS,
        total: RATE_LIMIT_REQUESTS,
        resetsAt: null,
      };
    }

    // Filter requests within the window
    const recentRequests = (data.requests as number[]).filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );

    const oldestRequest = recentRequests.length > 0 ? Math.min(...recentRequests) : null;
    const resetsAt = oldestRequest ? oldestRequest + RATE_LIMIT_WINDOW_MS : null;

    return {
      used: recentRequests.length,
      remaining: Math.max(0, RATE_LIMIT_REQUESTS - recentRequests.length),
      total: RATE_LIMIT_REQUESTS,
      resetsAt,
    };
  }
);

// Log client errors to Google Cloud Logging
interface ErrorLogData {
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  timestamp: string;
}

export const logClientError = onCall(
  {
    region: "europe-west1",
    maxInstances: 10,
    enforceAppCheck: true,
  },
  async (request) => {
    // Finding 6: Input-Validierung und Laengenbegrenzung
    const errorData = request.data as ErrorLogData;

    if (!errorData.message || typeof errorData.message !== "string") {
      throw new HttpsError("invalid-argument", "Fehlermeldung erforderlich");
    }

    const safeMessage = errorData.message.slice(0, 500);
    const safeStack = typeof errorData.stack === "string" ? errorData.stack.slice(0, 2000) : undefined;
    const safeUrl = typeof errorData.context?.url === "string"
      ? (errorData.context.url as string).slice(0, 500) : "unknown";
    const safeUserAgent = typeof errorData.context?.userAgent === "string"
      ? (errorData.context.userAgent as string).slice(0, 300) : "unknown";

    // Strukturiertes Logging fuer Google Cloud Logging
    console.error(JSON.stringify({
      severity: "ERROR",
      message: `Client Error: ${safeMessage}`,
      errorMessage: safeMessage,
      errorStack: safeStack,
      clientUrl: safeUrl,
      userAgent: safeUserAgent,
      timestamp: errorData.timestamp,
      userId: request.auth?.uid || "anonymous",
      labels: {
        type: "client-error",
        source: "web-app",
      },
    }));

    return { success: true };
  }
);

// ===================================
// BULK GENERATION - Background Processing
// ===================================

interface GenerationIdea {
  title: string;
  summary: string;
  area?: string;
  focus?: string;
  difficulty?: string;
}

interface GenerationJob {
  type: 'exercise' | 'session';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  userPrompt: string;
  ideas: GenerationIdea[];
  totalCount: number;
  completedCount: number;
  generatedIds: string[];
  errors: { index: number; message: string }[];
  createdBy: string;
  createdAt: admin.firestore.Timestamp;
  startedAt?: admin.firestore.Timestamp;
  completedAt?: admin.firestore.Timestamp;
}

// Generate ideas from a user prompt
export const generateIdeas = onCall(
  {
    region: "europe-west1",
    maxInstances: 5,
    secrets: ["GEMINI_API_KEY"],
    enforceAppCheck: true,
  },
  async (request) => {
    validateAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anmeldung erforderlich");
    }

    // Finding 1: Rollen-Check
    await requireTrainerRole(request.auth.uid);

    const { type } = request.data;
    const count = Math.min(Number(request.data.count) || 5, 20);

    // Finding 7: Input-Sanitierung
    const prompt = sanitizeTextInput(request.data.prompt, MAX_PROMPT_LENGTH);

    if (!prompt || !type) {
      throw new HttpsError("invalid-argument", "Prompt und Typ erforderlich");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError("internal", "API-Konfiguration fehlt");
    }

    const ideaPrompt = type === 'exercise'
      ? `Du bist ein erfahrener Rehasport-Trainer. Generiere ${count} verschiedene Übungsideen zum Thema "${prompt}".

Für jede Übung gib an:
- title: Prägnanter Name der Übung
- summary: Kurze Beschreibung (1 Satz)
- area: Körperbereich (Ganzkörper, Oberkörper, Unterkörper, Rumpf)
- focus: Trainingsfokus (Kraft, Beweglichkeit, Balance, Koordination, Ausdauer)
- difficulty: Schwierigkeit (Leicht, Mittel, Schwer)

Antworte NUR mit validem JSON:
{
  "ideas": [
    { "title": "...", "summary": "...", "area": "...", "focus": "...", "difficulty": "..." }
  ]
}`
      : `Du bist ein erfahrener Rehasport-Trainer. Generiere ${count} verschiedene Stunden-Ideen zum Thema "${prompt}".

Für jede Stunde gib an:
- title: Titel der Stunde
- summary: Kurze Beschreibung (1-2 Sätze)
- focus: Hauptfokus der Stunde

Antworte NUR mit validem JSON:
{
  "ideas": [
    { "title": "...", "summary": "...", "focus": "..." }
  ]
}`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const { text } = await generateWithFallback(genAI, ideaPrompt, {
        temperature: 0.8,
        maxOutputTokens: 2048,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Keine gültige JSON-Antwort erhalten");
      }

      const data = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        ideas: data.ideas as GenerationIdea[],
      };
    } catch (error) {
      console.error("Generate ideas error:", error);
      throw new HttpsError("internal", "Ideen-Generierung fehlgeschlagen");
    }
  }
);

// Start a bulk generation job
export const startBulkGeneration = onCall(
  {
    region: "europe-west1",
    maxInstances: 5,
    secrets: ["GEMINI_API_KEY"],
    enforceAppCheck: true,
  },
  async (request) => {
    validateAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anmeldung erforderlich");
    }

    const userId = request.auth.uid;

    // Finding 1: Rollen-Check
    await requireTrainerRole(userId);

    const { ideas, type, userPrompt } = request.data;

    if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
      throw new HttpsError("invalid-argument", "Keine Ideen ausgewählt");
    }

    if (ideas.length > 10) {
      throw new HttpsError("invalid-argument", "Maximal 10 Items pro Job");
    }

    // Check for existing active job
    const activeJobs = await db.collection("generationJobs")
      .where("createdBy", "==", userId)
      .where("status", "in", ["pending", "processing"])
      .limit(1)
      .get();

    if (!activeJobs.empty) {
      throw new HttpsError(
        "failed-precondition",
        "Du hast bereits einen aktiven Job. Bitte warte bis dieser fertig ist."
      );
    }

    // Create the job
    const jobRef = db.collection("generationJobs").doc();
    const job: Omit<GenerationJob, 'id'> = {
      type,
      status: "pending",
      userPrompt: userPrompt || "",
      ideas: ideas.map((idea: GenerationIdea) => ({
        ...idea,
        status: "pending",
      })),
      totalCount: ideas.length,
      completedCount: 0,
      generatedIds: [],
      errors: [],
      createdBy: userId,
      createdAt: admin.firestore.Timestamp.now(),
    };

    await jobRef.set(job);

    // Start processing in background (fire and forget)
    processJobInBackground(jobRef.id, userId).catch(console.error);

    return {
      success: true,
      jobId: jobRef.id,
    };
  }
);

// Background job processor
async function processJobInBackground(jobId: string, userId: string): Promise<void> {
  const jobRef = db.collection("generationJobs").doc(jobId);

  // Mark as processing
  await jobRef.update({
    status: "processing",
    startedAt: admin.firestore.Timestamp.now(),
  });

  const jobDoc = await jobRef.get();
  const job = jobDoc.data() as GenerationJob;

  if (!job) {
    console.error("Job not found:", jobId);
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    await jobRef.update({
      status: "failed",
      errors: [{ index: -1, message: "API-Konfiguration fehlt" }],
    });
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const generatedIds: string[] = [];
  const errors: { index: number; message: string }[] = [];

  for (let i = 0; i < job.ideas.length; i++) {
    const idea = job.ideas[i];

    try {
      // Rate limiting: 2 second pause between generations
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (job.type === 'exercise') {
        const exerciseId = await generateSingleExercise(genAI, idea, userId);
        generatedIds.push(exerciseId);
      } else {
        const sessionId = await generateSingleSession(genAI, idea, userId);
        generatedIds.push(sessionId);
      }

      // Update progress
      await jobRef.update({
        completedCount: i + 1,
        generatedIds,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      errors.push({ index: i, message });
      console.error(`Error generating item ${i}:`, error);
    }
  }

  // Mark as completed
  await jobRef.update({
    status: errors.length === job.ideas.length ? "failed" : "completed",
    completedAt: admin.firestore.Timestamp.now(),
    generatedIds,
    errors,
  });
}

// Generate a single exercise
async function generateSingleExercise(
  genAI: GoogleGenerativeAI,
  idea: GenerationIdea,
  userId: string
): Promise<string> {
  const prompt = `Du bist ein erfahrener Rehasport-Trainer. Erstelle eine vollständige Übungsbeschreibung für:

Titel: ${idea.title}
Beschreibung: ${idea.summary}
Bereich: ${idea.area || "Ganzkörper"}
Fokus: ${idea.focus || "Kraft"}
Schwierigkeit: ${idea.difficulty || "Mittel"}

Erstelle eine detaillierte Übung mit:
- Ausführung (Schritt für Schritt)
- Tipps für korrekte Haltung
- Alternative bei Knieproblemen (falls relevant)
- Alternative bei Schulterproblemen (falls relevant)
- Kontraindikationen (wann sollte man die Übung nicht machen)

Antworte NUR mit validem JSON:
{
  "title": "${idea.title}",
  "summary": "...",
  "area": "${idea.area || "Ganzkörper"}",
  "focus": "${idea.focus || "Kraft"}",
  "difficulty": "${idea.difficulty || "Mittel"}",
  "sections": [
    { "title": "Ausführung", "content": "..." },
    { "title": "Tipps", "content": "..." }
  ],
  "kneeAlternative": { "title": "...", "description": "..." } oder null,
  "shoulderAlternative": { "title": "...", "description": "..." } oder null,
  "contraindications": ["..."]
}`;

  const { text } = await generateWithFallback(genAI, prompt, {
    temperature: 0.7,
    maxOutputTokens: 2048,
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Keine gültige JSON-Antwort");
  }

  const exerciseData = JSON.parse(jsonMatch[0]);

  // Create slug from title
  const slug = exerciseData.title
    .toLowerCase()
    .replace(/[äöüß]/g, (c: string) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] || c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Save to Firestore
  const exerciseRef = db.collection("exercises").doc();
  await exerciseRef.set({
    ...exerciseData,
    slug,
    tags: [],
    createdBy: userId,
    createdVia: "ai-bulk",
    createdAt: Date.now(),
  });

  return exerciseRef.id;
}

// Generate a single session
async function generateSingleSession(
  genAI: GoogleGenerativeAI,
  idea: GenerationIdea,
  userId: string
): Promise<string> {
  // Load session rules
  let sessionRules = {
    totalDuration: 45,
    phases: [
      { name: "Aufwärmen", duration: 10, minExercises: 3, maxExercises: 5 },
      { name: "Hauptteil", duration: 15, minExercises: 4, maxExercises: 6 },
      { name: "Schwerpunkt", duration: 15, minExercises: 3, maxExercises: 5 },
      { name: "Ausklang", duration: 5, minExercises: 2, maxExercises: 4 },
    ],
  };

  try {
    const configDoc = await db.collection("config").doc("sessionRules").get();
    if (configDoc.exists) {
      const data = configDoc.data();
      if (data) {
        sessionRules = {
          totalDuration: data.totalDuration || 45,
          phases: data.phases || sessionRules.phases,
        };
      }
    }
  } catch {
    // Use defaults
  }

  const prompt = `Du bist ein erfahrener Rehasport-Trainer. Erstelle eine ${sessionRules.totalDuration}-Minuten Trainingsstunde:

Titel: ${idea.title}
Beschreibung: ${idea.summary}
Fokus: ${idea.focus || idea.title}

Die Stunde muss folgende Phasen haben:
${sessionRules.phases.map((p) => `- ${p.name}: ${p.duration} Minuten (${p.minExercises}-${p.maxExercises} Übungen)`).join("\n")}

Antworte NUR mit validem JSON:
{
  "title": "${idea.title}",
  "description": "...",
  "focus": "${idea.focus || idea.title}",
  "phases": [
    {
      "title": "Phasenname",
      "duration": "X Minuten",
      "exercises": [
        {
          "title": "Übungsname",
          "duration": "X Minuten",
          "description": "...",
          "kneeAlternative": "..." oder null,
          "shoulderAlternative": "..." oder null
        }
      ]
    }
  ]
}`;

  const { text } = await generateWithFallback(genAI, prompt, {
    temperature: 0.7,
    maxOutputTokens: 4096,
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Keine gültige JSON-Antwort");
  }

  const sessionData = JSON.parse(jsonMatch[0]);

  // Create slug from title
  const slug = sessionData.title
    .toLowerCase()
    .replace(/[äöüß]/g, (c: string) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] || c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Save as draft
  const draftRef = db.collection("drafts").doc();
  await draftRef.set({
    ...sessionData,
    slug,
    categorySlug: "allgemein",
    category: "Allgemein",
    duration: `${sessionRules.totalDuration} Minuten`,
    status: "pending",
    createdBy: userId,
    createdVia: "ai-bulk",
    createdAt: admin.firestore.Timestamp.now(),
  });

  return draftRef.id;
}

// Get job status
export const getJobStatus = onCall(
  {
    region: "europe-west1",
    maxInstances: 10,
    enforceAppCheck: true,
  },
  async (request) => {
    validateAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anmeldung erforderlich");
    }

    const { jobId } = request.data;

    if (!jobId) {
      throw new HttpsError("invalid-argument", "Job-ID erforderlich");
    }

    const jobDoc = await db.collection("generationJobs").doc(jobId).get();

    if (!jobDoc.exists) {
      throw new HttpsError("not-found", "Job nicht gefunden");
    }

    const job = jobDoc.data() as GenerationJob;

    // Only allow owner to see their job
    if (job.createdBy !== request.auth.uid) {
      throw new HttpsError("permission-denied", "Kein Zugriff auf diesen Job");
    }

    return {
      success: true,
      job: {
        ...job,
        id: jobDoc.id,
      },
    };
  }
);

// Get all jobs for user
export const getUserJobs = onCall(
  {
    region: "europe-west1",
    maxInstances: 10,
    enforceAppCheck: true,
  },
  async (request) => {
    validateAppCheck(request);

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Anmeldung erforderlich");
    }

    const userId = request.auth.uid;

    const jobsSnapshot = await db.collection("generationJobs")
      .where("createdBy", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const jobs = jobsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      };
    });

    return {
      success: true,
      jobs,
    };
  }
);
