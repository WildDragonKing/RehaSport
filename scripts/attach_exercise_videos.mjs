#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const FIREBASE_CLIENT_ID =
  "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com";
const FIREBASE_CLIENT_SECRET = "j9iVZfS8kkCEFUPaAeJV0sAi";
const FIRESTORE_ORIGIN = "https://firestore.googleapis.com";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const reviewArg = args.find((arg) => arg.startsWith("--review="));
const reviewPath =
  reviewArg?.split("=")[1] ||
  path.join(
    process.cwd(),
    "backups",
    "sora",
    "schulter-mobility",
    "video-review.json",
  );

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  if (!fs.existsSync(reviewPath)) {
    throw new Error(`Review-Datei nicht gefunden: ${reviewPath}`);
  }

  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  const entries = Array.isArray(review.entries) ? review.entries : [];

  const approved = entries.filter(
    (entry) => entry.approved === true && String(entry.videoUrl || "").trim(),
  );

  if (approved.length === 0) {
    console.log("Keine freigegebenen Videos mit videoUrl gefunden.");
    return;
  }

  const accessToken = await getAccessToken();
  const projectId = "rehasport-trainer";
  const results = [];

  for (const entry of approved) {
    const slug = String(entry.exerciseSlug || "").trim();
    if (!slug) {
      results.push({ entry: entry.exerciseTitle, status: "skipped", reason: "exerciseSlug fehlt" });
      continue;
    }

    const doc = await findExerciseBySlug(accessToken, projectId, slug);
    if (!doc) {
      results.push({ entry: entry.exerciseTitle, status: "skipped", reason: `Exercise mit slug=${slug} nicht gefunden` });
      continue;
    }

    const patchData = {
      media: {
        videoUrl: String(entry.videoUrl).trim(),
        thumbnailUrl: String(entry.thumbnailUrl || "").trim() || undefined,
      },
      updatedAt: new Date().toISOString(),
    };

    if (apply) {
      await patchExercise(accessToken, projectId, doc.id, patchData);
      results.push({ entry: entry.exerciseTitle, status: "updated", exerciseId: doc.id, slug });
    } else {
      results.push({ entry: entry.exerciseTitle, status: "dry-run", exerciseId: doc.id, slug });
    }
  }

  const reportDir = path.join(process.cwd(), "backups", "firestore");
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(reportDir, `attach-exercise-videos-report-${stamp}.json`);
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      reviewPath,
      apply,
      totalApproved: approved.length,
      results,
    }, null, 2)}\n`,
  );

  if (apply) {
    console.log(`Videos an Übungen angehängt. Report: ${reportPath}`);
  } else {
    console.log(`Dry-run abgeschlossen. Report: ${reportPath}`);
    console.log("Mit --apply werden die Video-URLs live in Firestore geschrieben.");
  }
}

async function findExerciseBySlug(accessToken, projectId, slug) {
  const rows = await firestoreRunQuery(accessToken, projectId, {
    from: [{ collectionId: "exercises" }],
    where: {
      fieldFilter: {
        field: { fieldPath: "slug" },
        op: "EQUAL",
        value: { stringValue: slug },
      },
    },
    limit: 1,
  });

  if (rows.length === 0) return null;
  const id = rows[0].document.name.split("/").pop();
  return { id };
}

async function patchExercise(accessToken, projectId, exerciseId, data) {
  const query = [
    "updateMask.fieldPaths=media",
    "updateMask.fieldPaths=updatedAt",
  ].join("&");

  const url = `${FIRESTORE_ORIGIN}/v1/projects/${projectId}/databases/(default)/documents/exercises/${exerciseId}?${query}`;

  const body = {
    fields: {
      media: jsToFirestoreValue(data.media),
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
    throw new Error(`Exercise-Update fehlgeschlagen (${exerciseId}): ${text}`);
  }
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
      if (child === undefined) continue;
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
