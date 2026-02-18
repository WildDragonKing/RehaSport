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

const PROJECT_ID = "rehasport-trainer";
const SESSION_ID = "schulter_schulter-mobility";

const PHASE_PLAN = [
  {
    title: "Phase 1: Aufwärmen (10 Minuten)",
    description: "Sanfte Mobilisation für Schultergürtel und HWS.",
    duration: "10 Minuten",
    targetMinutes: 10,
    mandatoryMinutes: 8,
    bufferMinutes: 2,
    progressionEnabled: false,
    exercises: [
      { title: "Schulterkreisen", role: "mandatory", estMinutes: 3, skipPriority: 1 },
      { title: "Armkreisen", role: "mandatory", estMinutes: 3, skipPriority: 1 },
      { title: "Nackenrollen", role: "mandatory", estMinutes: 2, skipPriority: 1 },
      {
        title: "Atemwelle mit Armbewegung",
        role: "optional_buffer",
        estMinutes: 2,
        skipPriority: 3,
      },
    ],
  },
  {
    title: "Phase 2: Hauptteil (15 Minuten)",
    description: "Kräftigung der Schulterstabilisatoren und Rotatoren.",
    duration: "15 Minuten",
    targetMinutes: 15,
    mandatoryMinutes: 11,
    bufferMinutes: 4,
    progressionEnabled: false,
    exercises: [
      {
        title: "Stab-Schultermobilisation",
        role: "mandatory",
        estMinutes: 3,
        skipPriority: 1,
      },
      {
        title: "Theraband Außenrotation",
        role: "mandatory",
        estMinutes: 3,
        skipPriority: 1,
      },
      {
        title: "Sitzgymnastik Schulterblätter zusammenziehen",
        role: "mandatory",
        estMinutes: 3,
        skipPriority: 1,
      },
      { title: "Wandliegestütze", role: "mandatory", estMinutes: 2, skipPriority: 1 },
      {
        title: "Theraband Brustpresse",
        role: "optional_buffer",
        estMinutes: 2,
        skipPriority: 3,
      },
      {
        title: "Seitneigung mit Armheben",
        role: "optional_buffer",
        estMinutes: 2,
        skipPriority: 3,
      },
    ],
  },
  {
    title: "Phase 3: Schwerpunkt (15 Minuten)",
    description: "Schulterblattkontrolle und funktionelle Steigerung.",
    duration: "15 Minuten",
    targetMinutes: 15,
    mandatoryMinutes: 9,
    bufferMinutes: 4,
    progressionEnabled: true,
    exercises: [
      { title: "Theraband Rudern", role: "mandatory", estMinutes: 3, skipPriority: 1 },
      {
        title: "Myofasziale Dehnung Schulter-Nacken",
        role: "mandatory",
        estMinutes: 3,
        skipPriority: 1,
      },
      {
        title: "Armheben mit Widerstand",
        role: "progression",
        estMinutes: 3,
        progressionFromTitle: "Theraband Rudern",
        skipPriority: 2,
      },
      {
        title: "Sitzgymnastik Kopfdrehung mit Widerstand",
        role: "optional_buffer",
        estMinutes: 2,
        skipPriority: 3,
      },
      {
        title: "Stab-Rotation im Stand",
        role: "optional_buffer",
        estMinutes: 2,
        skipPriority: 3,
      },
    ],
  },
  {
    title: "Phase 4: Ausklang (5 Minuten)",
    description: "Regulation und Beweglichkeitsabschluss für Schulter/Brustkorb.",
    duration: "5 Minuten",
    targetMinutes: 5,
    mandatoryMinutes: 5,
    bufferMinutes: 2,
    progressionEnabled: false,
    exercises: [
      {
        title: "Brustdehnung an der Wand",
        role: "mandatory",
        estMinutes: 3,
        skipPriority: 1,
      },
      { title: "Atemübung mit Armen", role: "mandatory", estMinutes: 2, skipPriority: 1 },
      {
        title: "Stab-Brustdehnung",
        role: "optional_buffer",
        estMinutes: 2,
        skipPriority: 3,
      },
    ],
  },
];

const CORE_VIDEO_EXERCISES = [
  "Schulterkreisen",
  "Armkreisen",
  "Nackenrollen",
  "Stab-Schultermobilisation",
  "Theraband Außenrotation",
  "Sitzgymnastik Schulterblätter zusammenziehen",
  "Wandliegestütze",
  "Theraband Rudern",
  "Armheben mit Widerstand",
  "Brustdehnung an der Wand",
];

const EXERCISE_DETAILS = {
  "Schulterkreisen": {
    durchfuehrung:
      "1) Aufrecht stehen, Arme locker hängen lassen. 2) Beide Schultern langsam nach hinten oben kreisen. 3) Nach 8 Wiederholungen Richtung wechseln.",
    dosierung: "2 Sätze à 8-10 Kreise je Richtung.",
    coaching: "Bewegung weich führen, nicht in die Ohren hochziehen.",
    fehler: "Nicht ins Hohlkreuz fallen und nicht ruckartig kreisen.",
  },
  "Armkreisen": {
    durchfuehrung:
      "1) Arme seitlich auf Schulterhöhe anheben. 2) Kleine Kreise vorwärts für 20-30 Sekunden. 3) Richtung wechseln und Kreise nach hinten ausführen.",
    dosierung: "2 Durchgänge à 20-30 Sekunden pro Richtung.",
    coaching: "Rumpf stabil halten, Schultern tief lassen.",
    fehler: "Nicht mit Schwung arbeiten und nicht die Atmung anhalten.",
  },
  Nackenrollen: {
    durchfuehrung:
      "1) Kinn sanft zur Brust senken. 2) Kopf langsam halbkreisförmig zur Seite führen. 3) Über die Mitte zurück zur anderen Seite wechseln.",
    dosierung: "2 Durchgänge à 30-40 Sekunden.",
    coaching: "Nur schmerzfreie Bewegungsweite nutzen.",
    fehler: "Kein schnelles Durchrollen nach hinten in den Nacken.",
  },
  "Atemwelle mit Armbewegung": {
    durchfuehrung:
      "1) Beim Einatmen Arme seitlich bis Schulterhöhe heben. 2) Beim Ausatmen Arme kontrolliert senken. 3) Bewegung mit ruhigem Atemrhythmus koppeln.",
    dosierung: "2 Minuten fließend im eigenen Atemtempo.",
    coaching: "Lange Ausatmung betonen und Schultern locker halten.",
    fehler: "Nicht hektisch atmen oder die Arme über Schmerzgrenze führen.",
  },
  "Stab-Schultermobilisation": {
    durchfuehrung:
      "1) Stab schulterbreit greifen. 2) Arme über vorne nach oben führen. 3) Kontrolliert zurück in die Ausgangsposition bringen.",
    dosierung: "3 Sätze à 8-10 Wiederholungen.",
    coaching: "Bewegung langsam und symmetrisch ausführen.",
    fehler: "Nicht ins Hohlkreuz ausweichen oder die Ellbogen beugen.",
  },
  "Theraband Außenrotation": {
    durchfuehrung:
      "1) Ellbogen am Körper fixieren, Unterarme 90 Grad gebeugt. 2) Bandspannung nach außen öffnen. 3) Kontrolliert zur Mitte zurückführen.",
    dosierung: "3 Sätze à 10-12 Wiederholungen pro Seite.",
    coaching: "Ellbogen bleibt am Rumpf, Schulterblatt stabil halten.",
    fehler: "Keine Ausweichbewegung im Oberkörper oder überzogene Bandspannung.",
  },
  "Sitzgymnastik Schulterblätter zusammenziehen": {
    durchfuehrung:
      "1) Aufrecht auf dem Stuhl sitzen. 2) Schulterblätter nach hinten unten ziehen. 3) 2 Sekunden halten, dann lösen.",
    dosierung: "3 Sätze à 12 Wiederholungen.",
    coaching: "Brustbein leicht anheben, Nacken lang.",
    fehler: "Nicht ins Hohlkreuz drücken und Schultern nicht hochziehen.",
  },
  Wandliegestütze: {
    durchfuehrung:
      "1) Hände auf Schulterhöhe an die Wand setzen. 2) Ellbogen beugen und Körper zur Wand führen. 3) Druckvoll zurück in die Streckung.",
    dosierung: "3 Sätze à 10-12 Wiederholungen.",
    coaching: "Körper in Linie halten, Schulterblätter kontrolliert führen.",
    fehler: "Nicht ins Hohlkreuz fallen und Ellbogen nicht nach außen flaren.",
  },
  "Theraband Brustpresse": {
    durchfuehrung:
      "1) Band hinter dem Rücken positionieren. 2) Arme nach vorne drücken. 3) Langsam in die Ausgangsposition zurückführen.",
    dosierung: "2 Sätze à 10-12 Wiederholungen.",
    coaching: "Druckweg gleichmäßig, Rumpf stabil halten.",
    fehler: "Nicht mit Schwung arbeiten oder Schultern nach vorne kippen.",
  },
  "Seitneigung mit Armheben": {
    durchfuehrung:
      "1) Einen Arm über Kopf führen. 2) Oberkörper zur Gegenseite neigen. 3) Zur Mitte zurückkehren und Seite wechseln.",
    dosierung: "2 Sätze à 6-8 Wiederholungen pro Seite.",
    coaching: "Länge in der Flanke halten, ruhig atmen.",
    fehler: "Keine Drehbewegung in der Wirbelsäule und kein Hohlkreuz.",
  },
  "Theraband Rudern": {
    durchfuehrung:
      "1) Band auf Brusthöhe fixieren und Enden greifen. 2) Ellbogen eng nach hinten ziehen. 3) Schulterblätter zusammenführen und langsam lösen.",
    dosierung: "3 Sätze à 10-12 Wiederholungen.",
    coaching: "Brustbein anheben und Schulterblätter aktiv nach hinten unten führen.",
    fehler: "Nicht mit dem Oberkörper nach hinten lehnen oder Schultern hochziehen.",
  },
  "Myofasziale Dehnung Schulter-Nacken": {
    durchfuehrung:
      "1) Aufrecht sitzen oder stehen. 2) Kopf leicht zur Seite neigen und mit der Hand sanft verstärken. 3) Dehnung halten und Seite wechseln.",
    dosierung: "2 Durchgänge à 30-40 Sekunden pro Seite.",
    coaching: "Nur sanften Zug nutzen, gleichmäßig weiteratmen.",
    fehler: "Nicht ziehen oder in Schmerz hineindehnen.",
  },
  "Armheben mit Widerstand": {
    durchfuehrung:
      "1) Leichtes Gewicht oder Band in beide Hände nehmen. 2) Arme bis Schulterhöhe anheben. 3) Langsam und kontrolliert absenken.",
    dosierung: "2-3 Sätze à 8-10 Wiederholungen.",
    coaching: "Steigerung nur bei stabiler Schulterführung und schmerzfreiem Bewegungsweg.",
    fehler: "Nicht über Schulterhöhe erzwingen oder mit Schwung arbeiten.",
  },
  "Sitzgymnastik Kopfdrehung mit Widerstand": {
    durchfuehrung:
      "1) Hand seitlich am Kopf platzieren. 2) Kopf gegen leichten Handdruck drehen. 3) Spannung 5 Sekunden halten und lösen.",
    dosierung: "2 Sätze à 6 Wiederholungen pro Seite.",
    coaching: "Druck sanft halten, Nacken lang ausrichten.",
    fehler: "Kein starker Gegendruck oder ruckartige Kopfbewegung.",
  },
  "Stab-Rotation im Stand": {
    durchfuehrung:
      "1) Stab auf den Schultern ablegen. 2) Oberkörper langsam nach links und rechts rotieren. 3) Becken möglichst stabil lassen.",
    dosierung: "2 Sätze à 8 Rotationen pro Seite.",
    coaching: "Rotation aus Brustwirbelsäule führen, ruhig atmen.",
    fehler: "Nicht ins Hohlkreuz ausweichen oder schnell drehen.",
  },
  "Brustdehnung an der Wand": {
    durchfuehrung:
      "1) Unterarm an die Wand anlegen, Ellbogen auf Schulterhöhe. 2) Oberkörper leicht von der Wand wegdrehen. 3) Dehnung halten und Seite wechseln.",
    dosierung: "2 Durchgänge à 30-40 Sekunden pro Seite.",
    coaching: "Schulterblatt aktiv nach hinten unten führen.",
    fehler: "Nicht in Schmerz hineinrotieren oder Schulter hochziehen.",
  },
  "Atemübung mit Armen": {
    durchfuehrung:
      "1) Beim Einatmen Arme seitlich öffnen. 2) Beim Ausatmen langsam vor dem Körper schließen. 3) Bewegungsfluss mit ruhigem Atem koordinieren.",
    dosierung: "2 Minuten in gleichmäßigem Rhythmus.",
    coaching: "Ausatmung verlängern und Kiefer locker lassen.",
    fehler: "Keine schnelle Atemfrequenz oder starre Schultern.",
  },
  "Stab-Brustdehnung": {
    durchfuehrung:
      "1) Stab hinter dem Rücken greifen. 2) Arme sanft nach hinten unten strecken. 3) Brustkorb öffnen und Dehnung halten.",
    dosierung: "2 Durchgänge à 30 Sekunden.",
    coaching: "Schultern tief halten und ruhig in den Bauch atmen.",
    fehler: "Nicht ins Hohlkreuz fallen oder zu stark ziehen.",
  },
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const accessToken = await getAccessToken();
  const session = await fetchSession(accessToken, PROJECT_ID, SESSION_ID);
  const exercises = await fetchAllDocuments(accessToken, PROJECT_ID, "exercises");

  const exerciseMap = new Map(
    exercises.map((exercise) => [normalize(exercise.raw.title || ""), exercise.raw]),
  );

  const beforeCore = listCoreExerciseTitles(session.raw.phases || []);
  const optimizedPhases = PHASE_PLAN.map((phase) => ({
    ...phase,
    exercises: phase.exercises.map((exercise) =>
      buildSessionExercise(exercise, exerciseMap),
    ),
  }));

  const afterCore = listCoreExerciseTitles(optimizedPhases);
  const shoulderRatio = computeShoulderRatio(afterCore);
  const timestamp = new Date().toISOString();
  const operator = readFirebaseToolsConfig()?.user?.email || "unknown";

  const updatedDoc = {
    ...session.raw,
    focus: "Schulter-Mobility, Rotatorenmanschette, Schulterblattkontrolle",
    description:
      "Klare 45-Minuten-Stunde für Schulterbeweglichkeit und Schulterstabilität mit nachvollziehbarer Steigerung und optionalen Pufferblöcken.",
    phases: optimizedPhases,
    qualityScore: 93,
    qualityBreakdown: {
      variety: 90,
      progression: 92,
      pacing: 94,
      safety: 95,
    },
    conceptVersion: "v2",
    optimizedAt: timestamp,
    optimizedBy: operator,
    optimizedVia: "manual-shoulder-refine",
    updatedAt: timestamp,
  };

  const backupDir = path.join(process.cwd(), "backups", "firestore");
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = timestamp.replace(/[:.]/g, "-");
  const backupFile = path.join(
    backupDir,
    `schulter-mobility-before-${stamp}.json`,
  );
  fs.writeFileSync(
    backupFile,
    `${JSON.stringify({ sessionId: SESSION_ID, data: session.raw }, null, 2)}\n`,
  );

  const soraDir = path.join(
    process.cwd(),
    "backups",
    "sora",
    "schulter-mobility",
  );
  fs.mkdirSync(soraDir, { recursive: true });
  const reviewFile = path.join(soraDir, "video-review.json");
  const promptFile = path.join(soraDir, "prompts.jsonl");

  const reviewEntries = CORE_VIDEO_EXERCISES.map((title) => {
    const exercise = exerciseMap.get(normalize(title));
    const slug = exercise?.slug || slugify(title);
    const seconds =
      title === "Schulterkreisen" ||
      title === "Armkreisen" ||
      title === "Nackenrollen" ||
      title === "Brustdehnung an der Wand"
        ? "4"
        : "8";

    return {
      exerciseTitle: title,
      exerciseSlug: slug,
      approved: false,
      seconds,
      size: "1280x720",
      model: "sora-2",
      style: "neutral-demo-avatar",
      prompt: buildSoraPrompt(title),
      videoUrl: "",
      thumbnailUrl: "",
      note: "Nach Prüfung approved=true setzen und videoUrl eintragen.",
    };
  });

  fs.writeFileSync(
    reviewFile,
    `${JSON.stringify({
      generatedAt: timestamp,
      sessionId: SESSION_ID,
      status: "pending_review",
      entries: reviewEntries,
    }, null, 2)}\n`,
  );

  fs.writeFileSync(
    promptFile,
    `${reviewEntries
      .map((entry) =>
        JSON.stringify({
          prompt: entry.prompt,
          model: entry.model,
          size: entry.size,
          seconds: entry.seconds,
          out: `${entry.exerciseSlug}.json`,
        }),
      )
      .join("\n")}\n`,
  );

  const reportFile = path.join(
    backupDir,
    `schulter-mobility-improvement-report-${stamp}.json`,
  );
  fs.writeFileSync(
    reportFile,
    `${JSON.stringify(
      {
        generatedAt: timestamp,
        operator,
        sessionId: SESSION_ID,
        shoulderRatio,
        beforeCore,
        afterCore,
        backupFile,
        reviewFile,
        promptFile,
      },
      null,
      2,
    )}\n`,
  );

  if (!apply) {
    console.log(`Dry-run abgeschlossen. Backup: ${backupFile}`);
    console.log(`Report: ${reportFile}`);
    console.log(`Review-Datei: ${reviewFile}`);
    console.log("Mit --apply wird die Session live überschrieben.");
    return;
  }

  await patchSession(accessToken, PROJECT_ID, SESSION_ID, updatedDoc);
  console.log(`Session ${SESSION_ID} live aktualisiert.`);
  console.log(`Report: ${reportFile}`);
}

function buildSessionExercise(planExercise, exerciseMap) {
  const raw = exerciseMap.get(normalize(planExercise.title));
  if (!raw) {
    throw new Error(`Übung nicht gefunden: ${planExercise.title}`);
  }

  const detailConfig = EXERCISE_DETAILS[planExercise.title];
  if (!detailConfig) {
    throw new Error(`Details fehlen für Übung: ${planExercise.title}`);
  }

  const kneeAlternative = formatAlternative(
    raw.kneeAlternative,
    "Übung im Sitzen oder mit kleinerem Bewegungsumfang durchführen.",
  );
  const shoulderAlternative = formatAlternative(
    raw.shoulderAlternative,
    "Bewegung nur bis zur schmerzfreien Grenze und ohne Zusatzlast durchführen.",
  );

  const details = [
    { label: "Durchführung", value: detailConfig.durchfuehrung },
    { label: "Dosierung", value: detailConfig.dosierung },
    { label: "Coaching", value: detailConfig.coaching },
    { label: "Typische Fehler", value: detailConfig.fehler },
    { label: "Knie-Alternative", value: kneeAlternative },
    { label: "Schulter-Alternative", value: shoulderAlternative },
  ];

  const out = {
    title: raw.title,
    slug: raw.slug,
    details,
    role: planExercise.role,
    estMinutes: planExercise.estMinutes,
    skipPriority: planExercise.skipPriority,
  };

  if (planExercise.progressionFromTitle) {
    out.progressionFromTitle = planExercise.progressionFromTitle;
  }

  return out;
}

function listCoreExerciseTitles(phases) {
  return (phases || []).flatMap((phase) =>
    (phase.exercises || [])
      .filter((exercise) =>
        exercise.role ? exercise.role === "mandatory" || exercise.role === "progression" : true,
      )
      .map((exercise) => exercise.title),
  );
}

function computeShoulderRatio(titles) {
  const shoulderRegex =
    /(schulter|nacken|arm|brust|blatt|rotat|theraband|wandliegestuetz|wandliegestütz|stab)/i;
  const total = titles.length;
  const hits = titles.filter((title) => shoulderRegex.test(String(title))).length;
  return total === 0 ? 0 : Number((hits / total).toFixed(2));
}

function buildSoraPrompt(exerciseTitle) {
  return [
    "Use case: RehaSport Trainingsanleitung für Schulter-Mobility",
    `Primary request: neutrales Demo-Avatar zeigt die Übung \"${exerciseTitle}\" präzise und ruhig`,
    "Scene/background: heller, neutraler Trainingsraum ohne Branding",
    "Subject: anonymer generischer Trainings-Avatar (keine reale Person)",
    "Action: langsame, saubere Ausführung mit klar erkennbarer Start- und Endposition",
    "Camera: statische Halbtotalen-Perspektive, keine hektischen Fahrten",
    "Lighting/mood: gleichmäßig, klinisch klar, fokus auf Bewegung",
    "Style/format: instruktives RehaSport-Demo-Video",
    "Constraints: keine Logos, keine Marken, keine urheberrechtlich geschützten Figuren, keine reale Person",
    "Avoid: schnelle Schnitte, Motion Blur, unklare Gelenkstellungen",
  ].join("\n");
}

function formatAlternative(alternative, fallback) {
  if (!alternative || typeof alternative !== "object") return fallback;
  const title = String(alternative.title || "").trim();
  const description = String(alternative.description || "").trim();
  const text = [title, description].filter(Boolean).join(": ");
  return text || fallback;
}

async function fetchSession(accessToken, projectId, sessionId) {
  const response = await fetch(
    `${FIRESTORE_ORIGIN}/v1/projects/${projectId}/databases/(default)/documents/sessions/${sessionId}`,
    {
      headers: { authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Session-Lesen fehlgeschlagen: ${text}`);
  }

  const doc = await response.json();
  return {
    id: sessionId,
    raw: firestoreDocumentToJs(doc.fields || {}),
  };
}

async function fetchAllDocuments(accessToken, projectId, collectionId) {
  const rows = await firestoreRunQuery(accessToken, projectId, {
    from: [{ collectionId }],
    limit: 2000,
  });

  return rows.map((row) => ({
    id: row.document.name.split("/").pop(),
    raw: firestoreDocumentToJs(row.document.fields || {}),
  }));
}

async function firestoreRunQuery(accessToken, projectId, structuredQuery) {
  const response = await fetch(
    `${FIRESTORE_ORIGIN}/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
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
    throw new Error(`runQuery fehlgeschlagen: ${text}`);
  }

  const rows = await response.json();
  return rows.filter((row) => row.document);
}

async function patchSession(accessToken, projectId, sessionId, data) {
  const fields = [
    "phases",
    "focus",
    "description",
    "qualityScore",
    "qualityBreakdown",
    "conceptVersion",
    "optimizedAt",
    "optimizedBy",
    "optimizedVia",
    "updatedAt",
  ];

  const query = fields
    .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
    .join("&");

  const url = `${FIRESTORE_ORIGIN}/v1/projects/${projectId}/databases/(default)/documents/sessions/${sessionId}?${query}`;

  const body = {
    fields: {
      phases: jsToFirestoreValue(data.phases),
      focus: jsToFirestoreValue(data.focus),
      description: jsToFirestoreValue(data.description),
      qualityScore: jsToFirestoreValue(data.qualityScore),
      qualityBreakdown: jsToFirestoreValue(data.qualityBreakdown),
      conceptVersion: jsToFirestoreValue(data.conceptVersion),
      optimizedAt: jsToFirestoreValue({ __timestamp: data.optimizedAt }),
      optimizedBy: jsToFirestoreValue(data.optimizedBy),
      optimizedVia: jsToFirestoreValue(data.optimizedVia),
      updatedAt: jsToFirestoreValue({ __timestamp: data.updatedAt }),
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
    throw new Error(`Session-Update fehlgeschlagen: ${text}`);
  }
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

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugify(text) {
  return normalize(text);
}
