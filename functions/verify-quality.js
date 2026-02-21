// Stichproben-Verifikation: 4 Sessions pruefen nach Qualitaets-Checkliste
const os = require("os");
const path = require("path");
const fs = require("fs");

const PROJECT = "rehasport-trainer";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const CLIENT_ID = "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com";
const CLIENT_SECRET = "j9iVZfS8kkCEFUPaAeJV0sAi";

async function getToken() {
  const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: config.tokens.refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  return (await resp.json()).access_token;
}

function parseFields(fields) {
  if (!fields) return {};
  const result = {};
  for (const [key, val] of Object.entries(fields)) {
    if ("stringValue" in val) result[key] = val.stringValue;
    else if ("integerValue" in val) result[key] = Number(val.integerValue);
    else if ("booleanValue" in val) result[key] = val.booleanValue;
    else if ("nullValue" in val) result[key] = null;
    else if ("mapValue" in val) result[key] = parseFields(val.mapValue.fields);
    else if ("arrayValue" in val)
      result[key] = (val.arrayValue.values || []).map((v) => {
        if ("mapValue" in v) return parseFields(v.mapValue.fields);
        if ("stringValue" in v) return v.stringValue;
        if ("booleanValue" in v) return v.booleanValue;
        return null;
      });
    else result[key] = null;
  }
  return result;
}

async function getSession(sessionId, token) {
  const url = `${BASE}/sessions/${sessionId}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await resp.json();
  return parseFields(data.fields);
}

// Qualitaets-Checkliste
function checkSession(session) {
  const results = [];
  let passes = 0;
  let total = 0;

  const phases = session.phases || [];

  // 1. Hat mindestens ein Spiel?
  total++;
  const hasGame = phases.some(p => (p.exercises || []).some(e => e.isGame));
  if (hasGame) { passes++; results.push("  [OK] Spiel vorhanden"); }
  else results.push("  [FAIL] Kein Spiel in der Session");

  // 2. Alle Alternativen <= 300 Zeichen?
  total++;
  let longAlts = 0;
  for (const phase of phases) {
    for (const ex of (phase.exercises || [])) {
      if (ex.kneeAlternative && ex.kneeAlternative.length > 300) longAlts++;
      if (ex.shoulderAlternative && ex.shoulderAlternative.length > 300) longAlts++;
    }
  }
  if (longAlts === 0) { passes++; results.push("  [OK] Alle Alternativen <= 300 Zeichen"); }
  else results.push(`  [WARN] ${longAlts} Alternativen > 300 Zeichen`);

  // 3. Keine Emoji in Alternativen?
  total++;
  let emojiCount = 0;
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  for (const phase of phases) {
    for (const ex of (phase.exercises || [])) {
      if (ex.kneeAlternative && emojiRegex.test(ex.kneeAlternative)) emojiCount++;
      if (ex.shoulderAlternative && emojiRegex.test(ex.shoulderAlternative)) emojiCount++;
    }
  }
  if (emojiCount === 0) { passes++; results.push("  [OK] Keine Emoji in Alternativen"); }
  else results.push(`  [FAIL] ${emojiCount} Alternativen mit Emoji`);

  // 4. Difficulty-Progression (Phase 1 = Leicht, Phase 3 = Schwer)?
  total++;
  let progOk = true;
  if (phases[0]) {
    const p1Exercises = phases[0].exercises || [];
    const allLeicht = p1Exercises.every(e => e.difficulty === "Leicht" || e.isGame);
    if (!allLeicht) progOk = false;
  }
  if (progOk) { passes++; results.push("  [OK] Phase 1 = Leicht"); }
  else results.push("  [WARN] Phase 1 hat nicht nur 'Leicht'-Uebungen");

  // 5. Keine Boilerplate-Durchfuehrung?
  total++;
  let boilerplateCount = 0;
  const boilerplates = ["eine fundamentale", "eine einfache und effektive", "selbstmassage der"];
  for (const phase of phases) {
    for (const ex of (phase.exercises || [])) {
      for (const d of (ex.details || [])) {
        if (d.label === "Durchführung" && boilerplates.some(bp => (d.value || "").toLowerCase().includes(bp))) {
          boilerplateCount++;
        }
      }
    }
  }
  if (boilerplateCount === 0) { passes++; results.push("  [OK] Keine Boilerplate-Durchfuehrung"); }
  else results.push(`  [FAIL] ${boilerplateCount} Boilerplate-Durchfuehrungen`);

  // 6. Keine generischen Coaching-Floskeln?
  total++;
  let genericCoaching = 0;
  const floskeln = ["ruhige, präzise wiederholungen mit gleichmäßiger atmung"];
  for (const phase of phases) {
    for (const ex of (phase.exercises || [])) {
      for (const d of (ex.details || [])) {
        if (d.label === "Coaching" && floskeln.some(f => (d.value || "").toLowerCase().includes(f))) {
          genericCoaching++;
        }
      }
    }
  }
  if (genericCoaching === 0) { passes++; results.push("  [OK] Keine generischen Coaching-Floskeln"); }
  else results.push(`  [WARN] ${genericCoaching} generische Coaching-Cues`);

  // 7. Uebungszahl pro Phase
  total++;
  let exerciseCountOk = true;
  for (const phase of phases) {
    const count = (phase.exercises || []).length;
    if (count > 8) { exerciseCountOk = false; results.push(`  [WARN] ${phase.title}: ${count} Uebungen (max 8 empfohlen)`); }
  }
  if (exerciseCountOk) { passes++; results.push("  [OK] Uebungszahl pro Phase angemessen"); }

  return { passes, total, results };
}

async function main() {
  const token = await getToken();

  // 4 Stichproben: Atemtherapie (thematisch gefixt), Beckenboden (Schwerpunkt gefixt),
  // Sitzgymnastik (Steh→Sitz), Schulter-Mobility (Best Practice)
  const sampleIds = [
    "atemtherapie_stunde-06-atemtherapie",
    "beckenboden_stunde-09-beckenboden-power",
    "sitzgymnastik_sitzgymnastik_komplett",
    "schulter_schulter-mobility",
  ];

  console.log("=== QUALITAETS-VERIFIKATION ===\n");

  let totalPasses = 0;
  let totalChecks = 0;

  for (const id of sampleIds) {
    const session = await getSession(id, token);
    console.log(`--- ${session.title} ---`);

    // Zeige Phasen-Struktur
    for (const phase of (session.phases || [])) {
      console.log(`\n  ${phase.title}:`);
      for (const ex of (phase.exercises || [])) {
        const slugInfo = ex.slug ? `[${ex.slug}]` : "[KEIN SLUG]";
        const gameInfo = ex.isGame ? " [SPIEL]" : "";
        const diffInfo = ex.difficulty ? ` (${ex.difficulty})` : "";
        console.log(`    - ${ex.title}${gameInfo}${diffInfo} ${slugInfo}`);

        // Zeige Alternativen-Laenge
        if (ex.kneeAlternative) {
          console.log(`      Knie-Alt: ${ex.kneeAlternative.length} Zeichen - "${ex.kneeAlternative.slice(0, 80)}..."`);
        }
      }
    }

    console.log("\n  Checkliste:");
    const { passes, total, results } = checkSession(session);
    for (const r of results) console.log(r);
    console.log(`  Score: ${passes}/${total}\n`);

    totalPasses += passes;
    totalChecks += total;
  }

  console.log("=".repeat(50));
  console.log(`GESAMT: ${totalPasses}/${totalChecks} Checks bestanden`);
}

main().catch(err => { console.error("FEHLER:", err.message); process.exit(1); });
