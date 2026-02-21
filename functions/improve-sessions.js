// Bestehende Sessions in Firestore verbessern:
// 1. Slug-Verknuepfung zur Uebungsbibliothek
// 2. Alternativen als strukturierte Felder
// 3. Schwierigkeitsgrade
// 4. isGame-Flag
// 5. Detail-Bereinigung (Alternativen aus Details entfernen)
const os = require("os");
const path = require("path");
const fs = require("fs");

const PROJECT = "rehasport-trainer";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

// Firebase CLI Client-ID (oeffentlich, Teil des Firebase CLI Source)
const CLIENT_ID =
  "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com";
const CLIENT_SECRET = "j9iVZfS8kkCEFUPaAeJV0sAi";

async function getToken() {
  const configPath = path.join(
    os.homedir(),
    ".config",
    "configstore",
    "firebase-tools.json",
  );
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const refreshToken = config.tokens.refresh_token;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  const data = await resp.json();
  return data.access_token;
}

// --- Firestore REST Helpers ---

function parseFields(fields) {
  if (!fields) return {};
  const result = {};
  for (const [key, val] of Object.entries(fields)) {
    result[key] = parseValue(val);
  }
  return result;
}

function parseValue(val) {
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return val.doubleValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("nullValue" in val) return null;
  if ("mapValue" in val) return parseFields(val.mapValue.fields);
  if ("arrayValue" in val)
    return (val.arrayValue.values || []).map(parseValue);
  if ("timestampValue" in val) return val.timestampValue;
  return null;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "boolean") return { booleanValue: val };
  if (Array.isArray(val))
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function fetchCollection(collectionName, token) {
  const docs = [];
  let pageToken = null;
  do {
    let url = `${BASE}/${collectionName}?pageSize=100`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    if (data.documents) docs.push(...data.documents);
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return docs;
}

function getDocId(name) {
  return name.split("/").pop();
}

// --- Slug Matching ---

function normalize(title) {
  return title
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function buildSlugMap(exercises) {
  const map = new Map();
  for (const ex of exercises) {
    const key = normalize(ex.title);
    map.set(key, ex.slug);
    // Auch ohne Klammer-Zusatz matchen
    const withoutParens = ex.title.replace(/\s*\(.*\)$/, "");
    if (withoutParens !== ex.title) {
      map.set(normalize(withoutParens), ex.slug);
    }
  }
  return map;
}

function findSlug(exerciseTitle, slugMap) {
  const key = normalize(exerciseTitle);
  if (slugMap.has(key)) return slugMap.get(key);

  // Ohne Klammer-Zusatz versuchen
  const withoutParens = exerciseTitle.replace(/\s*\(.*\)$/, "");
  if (withoutParens !== exerciseTitle) {
    const key2 = normalize(withoutParens);
    if (slugMap.has(key2)) return slugMap.get(key2);
  }

  // Teilstring-Match: Bibliothek-Titel in Session-Titel enthalten?
  for (const [mapKey, slug] of slugMap.entries()) {
    if (key.includes(mapKey) && mapKey.length > 5) return slug;
    if (mapKey.includes(key) && key.length > 5) return slug;
  }

  return null;
}

// --- Difficulty-Zuordnung anhand der Phase ---

function guessDifficulty(phaseTitle, exerciseTitle) {
  const t = (phaseTitle + " " + exerciseTitle).toLowerCase();
  if (t.includes("aufwärm") || t.includes("aufwaerm") || t.includes("ausklang")) {
    return "Leicht";
  }
  if (t.includes("schwerpunkt") || t.includes("phase 3")) {
    return "Schwer";
  }
  if (t.includes("hauptteil") || t.includes("phase 2")) {
    return "Mittel";
  }
  return "Mittel";
}

// --- Alternativen aus Details extrahieren ---

function extractAlternatives(details) {
  const cleanDetails = [];
  let kneeAlt = null;
  let shoulderAlt = null;

  for (const detail of details) {
    const label = (detail.label || "").trim();
    const value = (detail.value || "").trim();

    if (label.toLowerCase().includes("knie-alternative") || label.toLowerCase().includes("kniealternative")) {
      kneeAlt = value;
    } else if (label.toLowerCase().includes("schulter-alternative") || label.toLowerCase().includes("schulteralternative")) {
      shoulderAlt = value;
    } else {
      cleanDetails.push(detail);
    }
  }

  return { cleanDetails, kneeAlt, shoulderAlt };
}

// --- Spiel erkennen ---

function isGameExercise(title, slug) {
  if (slug && slug.startsWith("spiel-")) return true;
  const t = title.toLowerCase();
  return t.includes("spiel") || t.includes("staffel") || t.includes("parcours");
}

// --- Session verbessern ---

function improveSession(session, exercises, slugMap) {
  const phases = session.phases || [];
  let totalMatched = 0;
  let totalExercises = 0;

  const improvedPhases = phases.map((phase) => {
    const improvedExercises = (phase.exercises || []).map((ex) => {
      totalExercises++;
      const slug = ex.slug || findSlug(ex.title, slugMap);
      if (slug) totalMatched++;

      const { cleanDetails, kneeAlt, shoulderAlt } = extractAlternatives(
        ex.details || [],
      );

      const difficulty =
        ex.difficulty || guessDifficulty(phase.title, ex.title);
      const isGame = isGameExercise(ex.title, slug);

      const improved = {
        title: ex.title,
        details: cleanDetails,
        difficulty: difficulty,
      };

      if (slug) improved.slug = slug;
      if (kneeAlt) improved.kneeAlternative = kneeAlt;
      if (shoulderAlt) improved.shoulderAlternative = shoulderAlt;
      if (isGame) improved.isGame = true;

      return improved;
    });

    return {
      title: phase.title,
      description: phase.description || undefined,
      exercises: improvedExercises,
    };
  });

  return {
    phases: improvedPhases,
    stats: { totalExercises, totalMatched },
  };
}

// --- Firestore Update ---

async function updateSession(sessionId, phases, token) {
  const url = `${BASE}/sessions/${sessionId}?updateMask.fieldPaths=phases`;

  const resp = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        phases: toFirestoreValue(phases),
      },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Update ${sessionId} fehlgeschlagen: ${resp.status} ${err}`);
  }
}

// --- Main ---

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(dryRun ? "=== DRY RUN ===" : "=== LIVE UPDATE ===");

  const token = await getToken();

  const [sessionDocs, exerciseDocs] = await Promise.all([
    fetchCollection("sessions", token),
    fetchCollection("exercises", token),
  ]);

  const exercises = exerciseDocs.map((doc) => ({
    id: getDocId(doc.name),
    ...parseFields(doc.fields),
  }));

  const sessions = sessionDocs.map((doc) => ({
    id: getDocId(doc.name),
    ...parseFields(doc.fields),
  }));

  const slugMap = buildSlugMap(exercises);
  console.log(`Bibliothek: ${exercises.length} Uebungen, ${slugMap.size} Slug-Eintraege`);
  console.log(`Sessions: ${sessions.length}`);
  console.log("");

  let totalUpdated = 0;

  for (const session of sessions) {
    if (session.status !== "published") {
      console.log(`SKIP: ${session.title} (Status: ${session.status})`);
      continue;
    }

    const { phases, stats } = improveSession(session, exercises, slugMap);

    console.log(
      `${session.title}: ${stats.totalMatched}/${stats.totalExercises} Uebungen verknuepft`,
    );

    if (!dryRun) {
      await updateSession(session.id, phases, token);
      console.log(`  -> AKTUALISIERT`);
      totalUpdated++;
    }
  }

  console.log("");
  console.log(
    dryRun
      ? `Dry-Run abgeschlossen. ${sessions.length} Sessions analysiert.`
      : `${totalUpdated} Sessions aktualisiert.`,
  );
}

main().catch((err) => {
  console.error("FEHLER:", err.message);
  process.exit(1);
});
