// Analyse der Sessions: Uebersicht pro Session
const fs = require("fs");
const path = require("path");

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "firestore-data.json"), "utf-8")
);

const { sessions, exercises } = data;

// Uebungsbibliothek als Map (slug -> exercise)
const exerciseBySlug = new Map();
for (const ex of exercises) {
  if (ex.slug) exerciseBySlug.set(ex.slug, ex);
}

const SEP = "=".repeat(80);
const SEP2 = "-".repeat(60);

console.log(SEP);
console.log(`SESSIONS-ANALYSE (${sessions.length} Sessions, ${exercises.length} Uebungen in Bibliothek)`);
console.log(SEP);
console.log("");

for (const session of sessions) {
  console.log(SEP);
  console.log(`SESSION: ${session.title || "(kein Titel)"}`);
  console.log(`  Kategorie: ${session.category || "(keine)"}`);
  console.log(`  Fokus:     ${session.focus || "(keiner)"}`);
  console.log(`  Status:    ${session.status || "(keiner)"}`);
  console.log(`  ID:        ${session.id}`);
  console.log(SEP2);

  const phases = session.phases || [];
  if (phases.length === 0) {
    console.log("  (Keine Phasen vorhanden)");
    console.log("");
    continue;
  }

  let sessionGames = 0;
  let sessionMissingSlug = [];
  let sessionMissingKneeAlt = [];
  let sessionMissingShoulderAlt = [];

  for (let pi = 0; pi < phases.length; pi++) {
    const phase = phases[pi];
    const exs = phase.exercises || [];
    console.log(`  Phase ${pi + 1}: ${phase.title || "(kein Titel)"} (${exs.length} Uebungen)`);

    for (const ex of exs) {
      const hasSlug = !!ex.slug;
      const hasKneeAlt = !!ex.kneeAlternative;
      const hasShoulderAlt = !!ex.shoulderAlternative;
      const isGame = !!ex.isGame;

      if (!hasSlug) {
        sessionMissingSlug.push({ phase: phase.title, title: ex.title });
      }
      if (!hasKneeAlt) {
        sessionMissingKneeAlt.push({ phase: phase.title, title: ex.title });
      }
      if (!hasShoulderAlt) {
        sessionMissingShoulderAlt.push({ phase: phase.title, title: ex.title });
      }
      if (isGame) sessionGames++;
    }
  }

  // Zusammenfassung
  console.log("");

  if (sessionMissingSlug.length > 0) {
    console.log(`  OHNE SLUG (${sessionMissingSlug.length}):`);
    for (const m of sessionMissingSlug) {
      console.log(`    - [${m.phase}] ${m.title}`);
    }
  } else {
    console.log("  Alle Uebungen haben einen Slug.");
  }

  if (sessionMissingKneeAlt.length > 0) {
    console.log(`  OHNE Knie-Alternative (${sessionMissingKneeAlt.length}):`);
    for (const m of sessionMissingKneeAlt) {
      console.log(`    - [${m.phase}] ${m.title}`);
    }
  } else {
    console.log("  Alle Uebungen haben eine Knie-Alternative.");
  }

  if (sessionMissingShoulderAlt.length > 0) {
    console.log(`  OHNE Schulter-Alternative (${sessionMissingShoulderAlt.length}):`);
    for (const m of sessionMissingShoulderAlt) {
      console.log(`    - [${m.phase}] ${m.title}`);
    }
  } else {
    console.log("  Alle Uebungen haben eine Schulter-Alternative.");
  }

  console.log(`  Spiele (isGame=true): ${sessionGames}`);
  console.log("");
}
