// Firestore-Daten lesen und als firestore-data.json speichern
// Nutzt Firebase CLI Token + REST API
const os = require("os");
const path = require("path");
const fs = require("fs");

const PROJECT = "rehasport-trainer";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

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
  if (!data.access_token) {
    throw new Error("Token-Refresh fehlgeschlagen: " + JSON.stringify(data));
  }
  return data.access_token;
}

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

async function main() {
  console.log("Lade Firestore-Daten...");
  const token = await getToken();

  const [sessionDocs, exerciseDocs] = await Promise.all([
    fetchCollection("sessions", token),
    fetchCollection("exercises", token),
  ]);

  const sessions = sessionDocs.map((doc) => ({
    id: getDocId(doc.name),
    ...parseFields(doc.fields),
  }));

  const exercises = exerciseDocs.map((doc) => ({
    id: getDocId(doc.name),
    ...parseFields(doc.fields),
  }));

  console.log(`${sessions.length} Sessions geladen`);
  console.log(`${exercises.length} Uebungen geladen`);

  const output = { sessions, exercises };
  const outPath = path.join(__dirname, "firestore-data.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`Gespeichert: ${outPath}`);
}

main().catch((err) => {
  console.error("FEHLER:", err.message);
  process.exit(1);
});
