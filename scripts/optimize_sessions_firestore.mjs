#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const FIREBASE_CLIENT_ID =
  "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com";
const FIREBASE_CLIENT_SECRET = "j9iVZfS8kkCEFUPaAeJV0sAi";
const FIRESTORE_ORIGIN = "https://firestore.googleapis.com";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const batchSize = Number(
  [...args]
    .find((arg) => arg.startsWith("--batch-size="))
    ?.split("=")[1] || "5",
);

const projectId = resolveProjectId();
if (!projectId) {
  throw new Error("Konnte Firebase Projekt-ID nicht ermitteln.");
}

const nowIso = new Date().toISOString();
const operator = resolveOperatorEmail() || "unknown";

const accessToken = await getAccessToken();
const sessions = await fetchPublishedSessions(accessToken, projectId);
const exercises = await fetchAllDocuments(accessToken, projectId, "exercises");

if (sessions.length === 0) {
  console.log("Keine publizierten Sessions gefunden.");
  process.exit(0);
}

const backupPath = writeBackup(projectId, sessions);
console.log(`Backup erstellt: ${backupPath}`);

const exercisePool = buildExercisePool(exercises);
const optimized = sessions.map((session) =>
  optimizeSession(session, exercisePool, nowIso, operator),
);

const scored = optimized.map((item) => item.optimizedDoc.qualityScore ?? 0);
const avgScore = scored.reduce((sum, value) => sum + value, 0) / scored.length;
const belowThreshold = optimized.filter(
  (item) => (item.optimizedDoc.qualityScore ?? 0) < 75,
);

console.log(
  `Optimiert: ${optimized.length} Sessions, Durchschnittsscore ${avgScore.toFixed(1)}/100, unter 75: ${belowThreshold.length}`,
);

if (!apply) {
  console.log("Dry-Run abgeschlossen. Mit --apply werden die Daten geschrieben.");
  process.exit(0);
}

let processed = 0;
for (let start = 0; start < optimized.length; start += batchSize) {
  const batch = optimized.slice(start, start + batchSize);
  await Promise.all(
    batch.map((item) =>
      patchSessionDocument(accessToken, projectId, item.id, item.optimizedDoc),
    ),
  );
  processed += batch.length;
  console.log(`Batch geschrieben: ${processed}/${optimized.length}`);
}

const reportPath = writeReport(projectId, optimized, nowIso, operator);
console.log(`Fertig. Report: ${reportPath}`);

function resolveProjectId() {
  const fromEnv = readEnvFile(path.join(process.cwd(), "site", ".env"))?.[
    "VITE_FIREBASE_PROJECT_ID"
  ];
  if (fromEnv) return fromEnv;

  const firebasercPath = path.join(process.cwd(), ".firebaserc");
  if (fs.existsSync(firebasercPath)) {
    const data = JSON.parse(fs.readFileSync(firebasercPath, "utf8"));
    return data?.projects?.default || null;
  }

  return null;
}

function resolveOperatorEmail() {
  const cfg = readFirebaseToolsConfig();
  return cfg?.user?.email || null;
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const out = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    out[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return out;
}

function readFirebaseToolsConfig() {
  const file = path.join(
    os.homedir(),
    ".config",
    "configstore",
    "firebase-tools.json",
  );
  if (!fs.existsSync(file)) {
    throw new Error("firebase-tools Konfiguration nicht gefunden.");
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function getAccessToken() {
  const cfg = readFirebaseToolsConfig();
  const tokens = cfg?.tokens;
  if (!tokens?.refresh_token) {
    throw new Error("Kein Firebase Refresh Token gefunden.");
  }

  const now = Date.now();
  if (tokens.access_token && tokens.expires_at && tokens.expires_at > now + 60_000) {
    return tokens.access_token;
  }

  const body = new URLSearchParams({
    client_id: FIREBASE_CLIENT_ID,
    client_secret: FIREBASE_CLIENT_SECRET,
    refresh_token: tokens.refresh_token,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OAuth Refresh fehlgeschlagen: ${text}`);
  }

  const refreshed = await response.json();
  tokens.access_token = refreshed.access_token;
  tokens.expires_in = refreshed.expires_in;
  tokens.expires_at = Date.now() + refreshed.expires_in * 1000;
  cfg.tokens = tokens;

  const cfgPath = path.join(
    os.homedir(),
    ".config",
    "configstore",
    "firebase-tools.json",
  );
  fs.writeFileSync(cfgPath, `${JSON.stringify(cfg, null, "\t")}\n`);
  return refreshed.access_token;
}

async function firestoreRunQuery(accessToken, project, structuredQuery) {
  const response = await fetch(
    `${FIRESTORE_ORIGIN}/v1/projects/${project}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ structuredQuery }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Firestore runQuery fehlgeschlagen: ${text}`);
  }

  const rows = await response.json();
  return rows.filter((row) => row.document);
}

async function fetchPublishedSessions(accessToken, project) {
  const rows = await firestoreRunQuery(accessToken, project, {
    from: [{ collectionId: "sessions" }],
    where: {
      fieldFilter: {
        field: { fieldPath: "status" },
        op: "EQUAL",
        value: { stringValue: "published" },
      },
    },
    limit: 1000,
  });

  return rows.map((row) => {
    const id = row.document.name.split("/").pop();
    return {
      id,
      raw: firestoreDocumentToJs(row.document.fields || {}),
      firestoreName: row.document.name,
    };
  });
}

async function fetchAllDocuments(accessToken, project, collectionId) {
  const rows = await firestoreRunQuery(accessToken, project, {
    from: [{ collectionId }],
    limit: 2000,
  });
  return rows.map((row) => {
    const id = row.document.name.split("/").pop();
    return {
      id,
      raw: firestoreDocumentToJs(row.document.fields || {}),
    };
  });
}

function firestoreValueToJs(value) {
  if (value === null || value === undefined) return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map((item) => firestoreValueToJs(item));
  }
  if ("mapValue" in value) {
    return firestoreDocumentToJs(value.mapValue.fields || {});
  }
  return null;
}

function firestoreDocumentToJs(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = firestoreValueToJs(value);
  }
  return out;
}

function jsToFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return { nullValue: null };
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((item) => jsToFirestoreValue(item)) } };
  }
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }
  if (typeof value === "object" && value && "__timestamp" in value) {
    return { timestampValue: value.__timestamp };
  }
  if (typeof value === "object") {
    const fields = {};
    for (const [key, child] of Object.entries(value)) {
      fields[key] = jsToFirestoreValue(child);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

async function patchSessionDocument(accessToken, project, sessionId, doc) {
  const updateFields = [
    "phases",
    "qualityScore",
    "qualityBreakdown",
    "conceptVersion",
    "optimizedAt",
    "optimizedBy",
    "optimizedVia",
    "updatedAt",
  ];

  const query = updateFields
    .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
    .join("&");
  const url = `${FIRESTORE_ORIGIN}/v1/projects/${project}/databases/(default)/documents/sessions/${sessionId}?${query}`;

  const body = {
    fields: {
      phases: jsToFirestoreValue(doc.phases),
      qualityScore: jsToFirestoreValue(doc.qualityScore),
      qualityBreakdown: jsToFirestoreValue(doc.qualityBreakdown),
      conceptVersion: jsToFirestoreValue(doc.conceptVersion),
      optimizedAt: jsToFirestoreValue({ __timestamp: doc.optimizedAt }),
      optimizedBy: jsToFirestoreValue(doc.optimizedBy),
      optimizedVia: jsToFirestoreValue(doc.optimizedVia),
      updatedAt: jsToFirestoreValue({ __timestamp: doc.updatedAt }),
    },
  };

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Patch fehlgeschlagen für ${sessionId}: ${text}`);
  }
}

function writeBackup(project, sessionsData) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups", "firestore");
  fs.mkdirSync(backupDir, { recursive: true });
  const file = path.join(backupDir, `${project}-sessions-backup-${stamp}.json`);
  const payload = {
    createdAt: new Date().toISOString(),
    project,
    count: sessionsData.length,
    sessions: sessionsData,
  };
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
  return file;
}

function writeReport(project, optimizedData, timestamp, user) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportDir = path.join(process.cwd(), "backups", "firestore");
  fs.mkdirSync(reportDir, { recursive: true });
  const file = path.join(reportDir, `${project}-sessions-report-${stamp}.json`);
  const report = {
    executedAt: timestamp,
    executedBy: user,
    project,
    total: optimizedData.length,
    sessions: optimizedData.map((item) => ({
      id: item.id,
      title: item.optimizedDoc.title,
      qualityScore: item.optimizedDoc.qualityScore,
      qualityBreakdown: item.optimizedDoc.qualityBreakdown,
      totalExercises: item.optimizedDoc.phases.reduce(
        (sum, phase) => sum + phase.exercises.length,
        0,
      ),
      totalBufferMinutes: item.optimizedDoc.phases.reduce(
        (sum, phase) => sum + (phase.bufferMinutes || 0),
        0,
      ),
    })),
  };
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);
  return file;
}

function buildExercisePool(exercisesData) {
  return exercisesData.map((doc) => {
    const difficultyLevel = parseDifficultyLevel(doc.raw.difficulty);
    const phaseKey = normalizePhaseKey(doc.raw.area || "");
    return {
      id: doc.id,
      title: cleanTitle(doc.raw.title || doc.id),
      summary: String(doc.raw.summary || "").trim(),
      focusTokens: tokenize(doc.raw.focus),
      phaseKey,
      difficultyLevel,
      kneeAlternative: normalizeAlternative(doc.raw.kneeAlternative),
      shoulderAlternative: normalizeAlternative(doc.raw.shoulderAlternative),
    };
  });
}

function cleanTitle(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAlternative(value) {
  if (!value || typeof value !== "object") return "";
  const title = String(value.title || "").trim();
  const description = String(value.description || "").trim();
  return [title, description].filter(Boolean).join(": ");
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[,\-/]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePhaseKey(input) {
  const text = String(input || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .trim();
  if (text.includes("aufwaermen") || text.includes("warmup") || text.includes("phase 1")) {
    return "warmup";
  }
  if (text.includes("hauptteil") || text.includes("main") || text.includes("phase 2")) {
    return "main";
  }
  if (
    text.includes("schwerpunkt") ||
    text.includes("focus") ||
    text.includes("phase 3")
  ) {
    return "focus";
  }
  if (
    text.includes("ausklang") ||
    text.includes("cooldown") ||
    text.includes("phase 4")
  ) {
    return "cooldown";
  }
  return "generic";
}

function parseDifficultyLevel(value) {
  const text = String(value || "")
    .toLowerCase()
    .replace(/:/g, "")
    .trim();
  if (!text) return 2;
  if (
    text.includes("leicht") ||
    text.includes("anfaenger") ||
    text.includes("anfanger")
  ) {
    return 1;
  }
  if (text.includes("schwer") || text.includes("fortgeschritten")) {
    return 3;
  }
  return 2;
}

function parseMinutes(value, fallback = 2) {
  const text = String(value || "").toLowerCase();
  const xSec = text.match(/(\d+)\s*x\s*(\d+)\s*sek/);
  if (xSec) {
    return clamp(Math.round((Number(xSec[1]) * Number(xSec[2])) / 60), 1, 10);
  }
  const xMin = text.match(/(\d+)\s*x\s*(\d+)\s*min/);
  if (xMin) {
    return clamp(Number(xMin[1]) * Number(xMin[2]), 1, 20);
  }
  const min = text.match(/(\d+)\s*min/);
  if (min) {
    return clamp(Number(min[1]), 1, 20);
  }
  const sec = text.match(/(\d+)\s*sek/);
  if (sec) {
    return clamp(Math.round(Number(sec[1]) / 60), 1, 5);
  }
  return fallback;
}

function getPhaseTargetMinutes(phaseKey, rawDuration) {
  const parsed = parseMinutes(rawDuration, NaN);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  if (phaseKey === "warmup") return 10;
  if (phaseKey === "main") return 15;
  if (phaseKey === "focus") return 15;
  if (phaseKey === "cooldown") return 5;
  return 10;
}

function optimizeSession(session, exercisePool, timestamp, user) {
  const raw = session.raw;
  const phases = Array.isArray(raw.phases) ? raw.phases : [];
  const usedTitles = new Set();
  const focusTokens = tokenize(raw.focus);
  const optimizedPhases = [];

  for (const phase of phases) {
    const phaseKey = normalizePhaseKey(phase.title || "");
    const targetMinutes = getPhaseTargetMinutes(phaseKey, phase.duration);
    const incoming = Array.isArray(phase.exercises) ? phase.exercises : [];

    const mandatory = [];
    for (const exercise of incoming) {
      const title = cleanTitle(exercise.title);
      const key = title.toLowerCase();
      if (!title || usedTitles.has(key)) continue;
      const normalizedDetails = normalizeDetails(exercise.details);
      const estMinutes = estimateFromDetails(normalizedDetails, 2);
      mandatory.push({
        title,
        details: normalizedDetails,
        role: "mandatory",
        estMinutes,
        skipPriority: 1,
      });
      usedTitles.add(key);
    }

    if (mandatory.length === 0) {
      const fallback = pickExerciseCandidate(exercisePool, {
        phaseKey,
        usedTitles,
        focusTokens,
      });
      if (fallback) {
        mandatory.push(createGeneratedExercise(fallback, "mandatory", 1));
        usedTitles.add(fallback.title.toLowerCase());
      }
    }

    const progression = [];
    const allowProgression = phaseKey === "main" || phaseKey === "focus";
    if (allowProgression && mandatory.length > 0) {
      const base = mandatory[mandatory.length - 1];
      const candidate = pickExerciseCandidate(exercisePool, {
        phaseKey,
        usedTitles,
        focusTokens,
        minDifficulty: 2,
      });
      if (candidate) {
        progression.push(
          createGeneratedExercise(candidate, "progression", 2, base.title),
        );
        usedTitles.add(candidate.title.toLowerCase());
      }
    }

    const bufferCount = getBufferCount(phaseKey);
    const buffer = [];
    for (let i = 0; i < bufferCount; i += 1) {
      const candidate = pickExerciseCandidate(exercisePool, {
        phaseKey,
        usedTitles,
        focusTokens,
      });
      if (!candidate) break;
      buffer.push(createGeneratedExercise(candidate, "optional_buffer", 3));
      usedTitles.add(candidate.title.toLowerCase());
    }

    const allExercises = [...mandatory, ...progression, ...buffer];
    const mandatoryMinutes = sumEstMinutes(mandatory) + sumEstMinutes(progression);
    const bufferMinutes = sumEstMinutes(buffer);

    optimizedPhases.push({
      title: phase.title || humanTitleForPhase(phaseKey),
      description: phase.description || "",
      duration: `${targetMinutes} Minuten`,
      targetMinutes,
      mandatoryMinutes,
      bufferMinutes,
      progressionEnabled: progression.length > 0,
      exercises: allExercises,
    });
  }

  const quality = computeQuality(optimizedPhases);
  const optimizedDoc = {
    ...raw,
    phases: optimizedPhases,
    qualityScore: quality.total,
    qualityBreakdown: quality.breakdown,
    conceptVersion: "v2",
    optimizedAt: timestamp,
    optimizedBy: user,
    optimizedVia: "ai-session-optimizer",
    updatedAt: timestamp,
  };

  return { id: session.id, optimizedDoc };
}

function normalizeDetails(details) {
  const input = Array.isArray(details) ? details : [];
  const map = new Map();

  for (const detail of input) {
    const label = normalizeDetailLabel(detail?.label);
    const value = String(detail?.value || "").trim();
    if (!label || !value || map.has(label)) continue;
    map.set(label, value);
  }

  if (!map.has("Durchführung")) {
    map.set("Durchführung", "2 Minuten kontrolliert durchführen.");
  }
  if (!map.has("Coaching")) {
    map.set("Coaching", "Ruhig atmen und sauber in der Ausführung bleiben.");
  }
  if (!map.has("Knie-Alternative")) {
    map.set("Knie-Alternative", "Im Sitzen oder mit kleinerem Bewegungsumfang ausführen.");
  }
  if (!map.has("Schulter-Alternative")) {
    map.set(
      "Schulter-Alternative",
      "Arme nur im schmerzfreien Bereich und ohne Druck einsetzen.",
    );
  }

  return [...map.entries()].map(([label, value]) => ({ label, value }));
}

function normalizeDetailLabel(label) {
  const text = String(label || "")
    .toLowerCase()
    .replace(/[^a-z0-9äöüß ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (text.includes("durchf")) return "Durchführung";
  if (text.includes("coach")) return "Coaching";
  if (text.includes("knie")) return "Knie-Alternative";
  if (text.includes("schulter")) return "Schulter-Alternative";
  return label;
}

function estimateFromDetails(details, fallback) {
  const run = details.find((detail) => detail.label === "Durchführung")?.value;
  return parseMinutes(run, fallback);
}

function pickExerciseCandidate(pool, options) {
  const matches = pool
    .filter((exercise) => !options.usedTitles.has(exercise.title.toLowerCase()))
    .filter(
      (exercise) =>
        exercise.phaseKey === options.phaseKey || exercise.phaseKey === "generic",
    )
    .filter((exercise) =>
      options.minDifficulty ? exercise.difficultyLevel >= options.minDifficulty : true,
    );

  if (matches.length === 0) return null;

  matches.sort((a, b) => {
    const focusA = overlapScore(a.focusTokens, options.focusTokens);
    const focusB = overlapScore(b.focusTokens, options.focusTokens);
    if (focusA !== focusB) return focusB - focusA;
    if (a.difficultyLevel !== b.difficultyLevel) {
      return a.difficultyLevel - b.difficultyLevel;
    }
    return a.title.localeCompare(b.title, "de");
  });

  return matches[0];
}

function overlapScore(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  const setB = new Set(b);
  return a.reduce((count, token) => (setB.has(token) ? count + 1 : count), 0);
}

function createGeneratedExercise(candidate, role, skipPriority, progressionFromTitle) {
  const details = [
    {
      label: "Durchführung",
      value: candidate.summary
        ? `${candidate.summary} (ca. 2 Minuten)`
        : "2 Minuten kontrolliert durchführen.",
    },
    {
      label: "Coaching",
      value:
        role === "progression"
          ? "Steigerung nur wenn stabil und schmerzfrei möglich."
          : "Ruhige, präzise Wiederholungen mit gleichmäßiger Atmung.",
    },
    {
      label: "Knie-Alternative",
      value:
        candidate.kneeAlternative ||
        "Im Sitzen oder mit kleinerem Bewegungsumfang ausführen.",
    },
    {
      label: "Schulter-Alternative",
      value:
        candidate.shoulderAlternative ||
        "Arme nur im schmerzfreien Bereich einsetzen.",
    },
  ];

  const exercise = {
    title: candidate.title,
    details,
    role,
    estMinutes: 2,
    skipPriority,
  };

  if (progressionFromTitle) {
    exercise.progressionFromTitle = progressionFromTitle;
  }
  return exercise;
}

function getBufferCount(phaseKey) {
  if (phaseKey === "warmup") return 1;
  if (phaseKey === "main") return 2;
  if (phaseKey === "focus") return 2;
  if (phaseKey === "cooldown") return 1;
  return 1;
}

function sumEstMinutes(exercises) {
  return exercises.reduce((sum, exercise) => sum + (exercise.estMinutes || 0), 0);
}

function humanTitleForPhase(phaseKey) {
  if (phaseKey === "warmup") return "Aufwärmen";
  if (phaseKey === "main") return "Hauptteil";
  if (phaseKey === "focus") return "Schwerpunkt";
  if (phaseKey === "cooldown") return "Ausklang";
  return "Phase";
}

function computeQuality(phases) {
  const all = phases.flatMap((phase) => phase.exercises);
  const titles = all.map((exercise) => exercise.title.toLowerCase());
  const unique = new Set(titles).size;
  const variety = titles.length > 0 ? Math.round((unique / titles.length) * 100) : 0;

  const progressivePhases = phases.filter(
    (phase) => normalizePhaseKey(phase.title) === "main" || normalizePhaseKey(phase.title) === "focus",
  );
  const progressionHits = progressivePhases.filter(
    (phase) =>
      phase.exercises.filter((exercise) => exercise.role === "progression").length > 0,
  ).length;
  const progression =
    progressivePhases.length > 0
      ? Math.round((progressionHits / progressivePhases.length) * 100)
      : 0;

  const bufferMinutes = phases.reduce(
    (sum, phase) => sum + Number(phase.bufferMinutes || 0),
    0,
  );
  const pacing = computePacingScore(bufferMinutes);

  const safetyPairs = all.filter((exercise) => {
    const labels = new Set(
      (exercise.details || []).map((detail) => normalizeDetailLabel(detail.label)),
    );
    return labels.has("Knie-Alternative") && labels.has("Schulter-Alternative");
  }).length;
  const safety = all.length > 0 ? Math.round((safetyPairs / all.length) * 100) : 0;

  const total = Math.round(
    variety * 0.35 + progression * 0.25 + pacing * 0.25 + safety * 0.15,
  );

  return {
    total,
    breakdown: {
      variety,
      progression,
      pacing,
      safety,
    },
  };
}

function computePacingScore(bufferMinutes) {
  if (bufferMinutes >= 8 && bufferMinutes <= 12) return 100;
  const delta = Math.abs(bufferMinutes - 10);
  return clamp(Math.round(100 - delta * 12), 0, 100);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
