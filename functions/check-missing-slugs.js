// Prueft welche Session-Uebungen keinen Slug haben (nach qualitativer Ueberarbeitung)
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
    else if ("mapValue" in val) result[key] = parseFields(val.mapValue.fields);
    else if ("arrayValue" in val) result[key] = (val.arrayValue.values || []).map(v => {
      if ("mapValue" in v) return parseFields(v.mapValue.fields);
      if ("stringValue" in v) return v.stringValue;
      return null;
    });
    else result[key] = null;
  }
  return result;
}

async function fetchCollection(name, token) {
  const docs = [];
  let pageToken = null;
  do {
    let url = `${BASE}/${name}?pageSize=100`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await resp.json();
    if (data.documents) docs.push(...data.documents);
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return docs;
}

async function main() {
  const token = await getToken();
  const sessionDocs = await fetchCollection("sessions", token);

  const missing = [];

  for (const doc of sessionDocs) {
    const session = parseFields(doc.fields);
    if (session.status !== "published") continue;

    for (const phase of (session.phases || [])) {
      for (const ex of (phase.exercises || [])) {
        if (!ex.slug) {
          missing.push({
            session: session.title,
            phase: phase.title,
            exercise: ex.title,
            isGame: ex.isGame || false,
          });
        }
      }
    }
  }

  console.log(`\n${missing.length} Uebungen ohne Slug:\n`);
  const grouped = {};
  for (const m of missing) {
    if (!grouped[m.session]) grouped[m.session] = [];
    grouped[m.session].push(m);
  }
  for (const [session, exercises] of Object.entries(grouped)) {
    console.log(`${session}:`);
    for (const ex of exercises) {
      console.log(`  - ${ex.exercise}${ex.isGame ? " [SPIEL]" : ""} (${ex.phase})`);
    }
  }
}

main().catch(err => { console.error("FEHLER:", err.message); process.exit(1); });
