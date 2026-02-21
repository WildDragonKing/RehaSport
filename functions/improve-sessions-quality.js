// Qualitative Ueberarbeitung aller Sessions:
// 1. Garbled Alternativen kuerzen (>150 Zeichen → 1-2 Saetze)
// 2. Emoji entfernen
// 3. Difficulty korrigieren (passive Uebungen → Leicht)
// 4. Boilerplate-Durchfuehrung durch konkrete Anleitungen ersetzen
// 5. Coaching-Cues uebungsspezifisch machen
// 6. Spiele in Phase 1 einfuegen (isGame: true)
// 7. Thematische Inkohaerenzen fixen (5 Sessions)
const os = require("os");
const path = require("path");
const fs = require("fs");

const PROJECT = "rehasport-trainer";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const CLIENT_ID =
  "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com";
const CLIENT_SECRET = "j9iVZfS8kkCEFUPaAeJV0sAi";

// --- Firestore Infrastruktur (aus improve-sessions.js) ---

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

async function updateSession(sessionId, phases, token) {
  const url = `${BASE}/sessions/${sessionId}?updateMask.fieldPaths=phases`;
  const resp = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: { phases: toFirestoreValue(phases) },
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(
      `Update ${sessionId} fehlgeschlagen: ${resp.status} ${err}`,
    );
  }
}

// ============================================================
// QUALITATIVE VERBESSERUNGEN
// ============================================================

// --- 1. Alternativen kuerzen ---

function shortenAlternative(text) {
  if (!text || text.length <= 150) return text;

  // Entferne "Bei Knieproblemen: " / "Bei Schulterproblemen: " Prefix
  let cleaned = text
    .replace(/^Bei Knieproblemen:\s*/i, "")
    .replace(/^Bei Schulterproblemen:\s*/i, "");

  // Entferne "Alternative Übung: " Prefix
  cleaned = cleaned.replace(/^Alternative Übung:\s*/i, "");

  // Nimm nur den ersten sinnvollen Satz (bis zum ersten Punkt oder Newline)
  const firstSentence = cleaned.split(/[.\n]/)[0].trim();

  // Wenn der erste Satz zu kurz ist, versuche den zweiten dazu
  if (firstSentence.length < 30) {
    const parts = cleaned.split(/[.\n]/).filter((p) => p.trim().length > 0);
    if (parts.length >= 2) {
      return (parts[0].trim() + ". " + parts[1].trim()).slice(0, 200) + ".";
    }
  }

  // Stelle sicher dass es mit Punkt endet
  if (firstSentence.length > 0) {
    return firstSentence.endsWith(".")
      ? firstSentence
      : firstSentence + ".";
  }
  return text.slice(0, 150) + "...";
}

// --- 2. Emoji entfernen ---

function removeEmojis(text) {
  if (!text) return text;
  // Entferne gaengige Emojis (Muskeln, Beine, etc.)
  return text
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}]/gu,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

// --- 3. Difficulty-Korrekturen ---

const PASSIVE_EXERCISES = [
  "body scan",
  "progressive muskelentspannung",
  "rückenlage mit angestellten beinen",
  "rückenlage entspannung",
  "atemübung zum abschluss",
  "atemübung 4-7-8",
  "bauchatmung im liegen",
  "seitliche rumpfdehnung im sitzen",
];

function fixDifficulty(title, currentDifficulty) {
  const t = title.toLowerCase();
  for (const passive of PASSIVE_EXERCISES) {
    if (t.includes(passive)) return "Leicht";
  }
  return currentDifficulty;
}

// --- 4. Boilerplate-Durchfuehrung ersetzen ---

const CONCRETE_INSTRUCTIONS = {
  einbeinstand: {
    label: "Durchführung",
    value:
      "Füße hüftbreit aufstellen. Gewicht auf das rechte Bein verlagern, linken Fuß langsam vom Boden lösen. 15 Sek. halten, Seite wechseln. 3 Durchgänge pro Seite.",
  },
  "armheben mit widerstand": {
    label: "Durchführung",
    value:
      "Theraband unter beide Füße klemmen, Enden greifen. Arme seitlich bis Schulterhöhe heben, 2 Sek. oben halten, langsam senken. 2×12 Wiederholungen.",
  },
  "faszienrolle oberschenkel": {
    label: "Durchführung",
    value:
      "Auf die Rolle setzen, Hände stützen hinter dem Körper ab. Langsam vom Gesäß bis knapp über dem Knie rollen. 8-10 langsame Bahnen pro Seite.",
  },
  "spiraldynamische rotation": {
    label: "Durchführung",
    value:
      "Aufrechter Stand, Füße hüftbreit. Arme locker seitlich schwingen, dabei den Oberkörper langsam von links nach rechts rotieren lassen. 10 Rotationen pro Seite, Tempo langsam steigern.",
  },
  "brücke mit beckenboden-spannung": {
    label: "Durchführung",
    value:
      "Rückenlage, Füße aufgestellt. Beckenboden anspannen, dann Becken langsam Wirbel für Wirbel anheben bis Knie-Hüfte-Schulter eine Linie bilden. 5 Sek. oben halten, langsam abrollen. 10 Wiederholungen.",
  },
  "federndes wippen": {
    label: "Durchführung",
    value:
      "Aufrechter Stand, Knie leicht gebeugt. Fersen minimal vom Boden lösen und rhythmisch federn. Arme locker mitschwingen. 1-2 Minuten im eigenen Rhythmus.",
  },
  "beinpendel seitlich": {
    label: "Durchführung",
    value:
      "Seitlich an der Wand abstützen. Äußeres Bein gestreckt zur Seite schwingen und zurückführen. 15 Pendelbewegungen pro Seite, kontrolliertes Tempo.",
  },
  "atemübung 4-7-8": {
    label: "Durchführung",
    value:
      "Bequeme Sitz- oder Liegeposition. 4 Takte durch die Nase einatmen, 7 Takte Atem anhalten, 8 Takte langsam durch den Mund ausatmen. 4-6 Zyklen.",
  },
  "rückenkräftigung bauchlage": {
    label: "Durchführung",
    value:
      "Bauchlage, Stirn auf den Handrücken ablegen. Abwechselnd rechten Arm und linkes Bein wenige Zentimeter vom Boden abheben, 5 Sek. halten. 8 Wiederholungen pro Seite.",
  },
  "einbeiniges stehen mit gewicht": {
    label: "Durchführung",
    value:
      "Hüftbreiter Stand, leichte Hantel (0,5-1 kg) in einer Hand. Gegenüberliegendes Bein anheben, 10 Sek. halten. Seite wechseln. 3 Durchgänge pro Seite.",
  },
};

function isBoilerplate(value) {
  if (!value) return false;
  const lower = value.toLowerCase();
  return (
    lower.includes("eine fundamentale") ||
    lower.includes("eine einfache und effektive") ||
    lower.includes("selbstmassage der") ||
    lower.includes("fortgeschrittene ganzkörperrotation") ||
    lower.includes("klassische brückenübung") ||
    lower.includes("dynamische faszienübung") ||
    lower.includes("eine mobilisierende und kräftigende") ||
    lower.includes("eine bewährte atemtechnik") ||
    lower.includes("kräftigungsübung für die rückenstrecker") ||
    lower.includes("gleichgewichtsübung mit leichter")
  );
}

function replaceBoilerplate(exercise) {
  const titleLower = exercise.title.toLowerCase();
  for (const [key, replacement] of Object.entries(CONCRETE_INSTRUCTIONS)) {
    if (titleLower.includes(key)) {
      return exercise.details.map((detail) => {
        if (
          detail.label === "Durchführung" &&
          isBoilerplate(detail.value)
        ) {
          return replacement;
        }
        return detail;
      });
    }
  }
  return exercise.details;
}

// --- 5. Coaching-Cues ersetzen ---

const SPECIFIC_COACHING = {
  einbeinstand:
    "Blick auf einen festen Punkt richten. Bei Wackeln: Zehen aktiv in den Boden drücken. Standbein nicht durchstrecken.",
  "armheben mit widerstand":
    "Schultern bleiben unten, nicht hochziehen. Arme nur bis Schulterhöhe, Ellbogen leicht gebeugt. Langsam senken ist wichtiger als schnell heben.",
  "faszienrolle oberschenkel":
    "Schmerzhafte Stellen 10 Sek. verweilen lassen. Nie über Gelenke rollen. Druck über Armabstützung steuern - weniger ist mehr.",
  "spiraldynamische rotation":
    "Rotation kommt aus der Mitte, nicht aus den Armen. Füße bleiben am Boden. Schultern locker lassen, Kopf dreht leicht mit.",
  "brücke mit beckenboden-spannung":
    "Erst Beckenboden anspannen, dann heben. Knie zeigen zur Decke, nicht nach außen. Nacken bleibt lang auf der Matte.",
  "federndes wippen":
    "Fersen lösen sich minimal vom Boden. Knie bleiben leicht gebeugt. Rhythmisch und federnd, nicht hektisch. Achillessehne spüren.",
  "beinpendel seitlich":
    "Oberkörper bleibt ruhig und aufrecht. Schwungbein gestreckt, aber nicht überstreckt. Tempo kontrolliert, kein Reißen.",
  "atemübung 4-7-8":
    "4 Takte einatmen - 7 Takte halten - 8 Takte ausatmen. Tempo an die Gruppe anpassen, bei Schwindel normal weiteratmen.",
  "body scan":
    "Von den Füßen langsam nach oben wandern. Jede Körperregion 3-4 Atemzüge bewusst wahrnehmen. Anspannung nur registrieren, nicht bewerten.",
  "progressive muskelentspannung":
    "Muskelgruppe 5-7 Sek. anspannen, dann 20-30 Sek. bewusst entspannen. Spannung bei max. 70% halten. Unterschied zwischen Anspannung und Entspannung spüren.",
  "rückenkräftigung bauchlage":
    "Nur wenige Zentimeter abheben, kein Überstrecken. Blick zum Boden, Nacken lang. Ausatmen beim Heben.",
  "beckenlift":
    "Becken langsam und kontrolliert heben. Oberschenkel und Rumpf bilden eine Linie. Gesäß oben fest anspannen.",
  "schulterkreisen":
    "Große, runde Kreise machen. Beim Hochziehen einatmen, beim Senken ausatmen. Schultern nicht zu den Ohren hochziehen.",
  armkreisen:
    "Arme gestreckt auf Schulterhöhe. Kleine Kreise, die langsam größer werden. Schulterblätter zusammenziehen und lösen.",
  "marschieren auf der stelle":
    "Knie hüfthoch heben, Arme gegengleich mitschwingen. Gleichmäßiges Tempo, Füße bewusst abrollen.",
  "knie zur brust":
    "Knie langsam zur Brust ziehen, nicht reißen. Rücken bleibt auf der Matte. Ausatmen beim Heranziehen.",
  "seitliche rumpfdehnung":
    "In die Dehnung hineinatmen, beim Ausatmen vertiefen. Becken bleibt stabil, Neigung kommt aus dem Rumpf.",
};

const GENERIC_COACHING_PHRASES = [
  "ruhige, präzise wiederholungen mit gleichmäßiger atmung",
  "steigerung nur wenn stabil und schmerzfrei möglich",
  "ruhige, präzise wiederholungen",
];

function replaceCoachingCue(exercise) {
  const titleLower = exercise.title.toLowerCase();

  return exercise.details.map((detail) => {
    if (detail.label !== "Coaching") return detail;

    const valueLower = (detail.value || "").toLowerCase().trim();
    const isGeneric = GENERIC_COACHING_PHRASES.some(
      (phrase) => valueLower.includes(phrase),
    );
    if (!isGeneric) return detail;

    // Spezifischen Cue finden
    for (const [key, cue] of Object.entries(SPECIFIC_COACHING)) {
      if (titleLower.includes(key)) {
        return { label: "Coaching", value: cue };
      }
    }
    return detail;
  });
}

// --- 6. Spiele einfuegen ---

const GAME_DEFINITIONS = {
  verkehrsampelspiel: {
    title: "Verkehrsampelspiel",
    isGame: true,
    difficulty: "Leicht",
    details: [
      {
        label: "Durchführung",
        value:
          "Alle bewegen sich frei im Raum. Spielleiter zeigt Farbkarten: Grün = Gehen, Gelb = Langsam gehen, Rot = Stopp und kleine Übung (z.B. 3x Kniebeuge). 5 Minuten.",
      },
      {
        label: "Coaching",
        value:
          "Tempo und Stopp-Übungen an die Gruppe anpassen. Bei Rot themenpassende Übungen einbauen (z.B. Atemübung, Beckenboden anspannen).",
      },
    ],
    kneeAlternative:
      "Bei Rot: Armbewegungen statt Kniebeugen. Tempo reduzieren.",
    shoulderAlternative:
      "Arme locker hängen lassen. Stopp-Übungen ohne Armheben wählen.",
  },
  autospiel: {
    title: "Autospiel",
    isGame: true,
    difficulty: "Leicht",
    details: [
      {
        label: "Durchführung",
        value:
          'Alle bewegen sich im Raum. Spielleiter nennt den "Gang": 1. Gang = langsam gehen, 2. Gang = normales Tempo, 3. Gang = schnelles Gehen, R = rückwärts gehen. 5 Minuten.',
      },
      {
        label: "Coaching",
        value:
          "Temposteigerung langsam aufbauen. Rückwärts nur kurz und mit Blick über die Schulter. Ausweichen üben.",
      },
    ],
    kneeAlternative:
      "Nur 1. und 2. Gang nutzen. Kein schnelles Gehen, stattdessen große Schritte.",
    shoulderAlternative: "Keine Anpassung nötig.",
  },
  sitzfussball: {
    title: "Sitzfußball",
    isGame: true,
    difficulty: "Leicht",
    details: [
      {
        label: "Durchführung",
        value:
          "Stühle im Kreis mit 1m Abstand. Softball in die Mitte. Nur mit Füßen spielen, Ball maximal kniehoch. Zwei Mannschaften, Tor = zwischen zwei markierten Stühlen. 5 Minuten.",
      },
      {
        label: "Coaching",
        value:
          "Aufrecht sitzen bleiben. Langsame, kontrollierte Fußbewegungen. Kein Aufspringen vom Stuhl.",
      },
    ],
    kneeAlternative:
      "Ball mit der Fußinnenseite schieben statt schießen. Knie bleibt in Ruheposition.",
    shoulderAlternative: "Keine Anpassung nötig - Arme werden nicht gebraucht.",
  },
  "ziffern-und-bewegung": {
    title: "Ziffern und Bewegung",
    isGame: true,
    difficulty: "Leicht",
    details: [
      {
        label: "Durchführung",
        value:
          "Zahlen werden Bewegungen zugeordnet: 1 = Arme strecken, 2 = Bein heben, 3 = Schultern kreisen, 4 = auf der Stelle marschieren. Bei Zahlenaufruf führen alle die Bewegung aus. 5 Minuten.",
      },
      {
        label: "Coaching",
        value:
          "Mit 3 Zahlen starten, dann auf 5 steigern. Tempo langsam erhöhen. Dual-Task-Training für Gedächtnis und Motorik.",
      },
    ],
    kneeAlternative:
      "Bein heben durch Fußwippen ersetzen. Alle Übungen im Sitzen möglich.",
    shoulderAlternative:
      "Arme strecken durch Hände öffnen/schließen ersetzen. Nur schmerzfreien Bewegungsradius nutzen.",
  },
  "fang-das-tuch": {
    title: "Fang das Tuch",
    isGame: true,
    difficulty: "Leicht",
    details: [
      {
        label: "Durchführung",
        value:
          "Alle stehen im Kreis, jeder hält ein Jongliertuch. Auf Kommando: Tuch nach rechts werfen, Tuch von links fangen. 5 Minuten.",
      },
      {
        label: "Coaching",
        value:
          "Tücher nur auf Brusthöhe werfen. Rhythmus langsam aufbauen. Erst einzeln üben, dann im Kreis.",
      },
    ],
    kneeAlternative:
      "Im Sitzen ausführen. Tücher nur seitlich weiterreichen statt werfen.",
    shoulderAlternative:
      "Tücher nur auf Hüfthöhe werfen. Mit der schmerzfreien Hand werfen.",
  },
  reifenzielwurf: {
    title: "Reifenzielwurf",
    isGame: true,
    difficulty: "Leicht",
    details: [
      {
        label: "Durchführung",
        value:
          "Spielleiter hält Reifen auf Hüfthöhe. Teilnehmer werfen aus 2-3m Entfernung Softbälle durch den Reifen. Jeder 3 Versuche. 5 Minuten.",
      },
      {
        label: "Coaching",
        value:
          "Entfernung an die Gruppe anpassen. Unterhandwurf empfehlen. Ermuntern statt korrigieren.",
      },
    ],
    kneeAlternative: "Im Sitzen werfen. Entfernung verkürzen.",
    shoulderAlternative:
      "Unterhandwurf mit der schmerzfreien Hand. Reifen tiefer halten.",
  },
  crossboccia: {
    title: "Crossboccia",
    isGame: true,
    difficulty: "Leicht",
    details: [
      {
        label: "Durchführung",
        value:
          "Zielball werfen, dann versuchen alle ihre weichen Crossboccia-Bälle möglichst nah dran zu platzieren. In Teams oder einzeln. 5 Minuten.",
      },
      {
        label: "Coaching",
        value:
          "Weiche Bälle verwenden. Überall spielbar, auch in der Halle. Entfernung anpassen.",
      },
    ],
    kneeAlternative: "Im Sitzen werfen. Entfernung verkürzen.",
    shoulderAlternative:
      "Unterhandwurf. Nur mit der schmerzfreien Hand werfen.",
  },
};

// Zuordnung: Session-ID → Spiel-Key fuer Phase 1
const SESSION_GAME_MAP = {
  "atemtherapie_stunde-06-atemtherapie": "verkehrsampelspiel",
  balance_koordinationstraining: "ziffern-und-bewegung",
  balance_sturzprophylaxe: "autospiel",
  "beckenboden_stunde-09-beckenboden-power": "verkehrsampelspiel",
  "faszientraining_stunde-07-faszienfit": "autospiel",
  "faszientraining_stunde-10-faszien-entspannung": "verkehrsampelspiel",
  "ganzkoerper_kraft-und-balance": "sitzfussball",
  ganzkoerper_pezziball_stunde: "sitzfussball",
  ganzkoerper_theraband_komplett: "ziffern-und-bewegung",
  "herz-kreislauf_ausdauer-aktivierung": "autospiel",
  "knie-huefte_knie_hueft_schule": "verkehrsampelspiel",
  "osteoporose_stunde-08-starke-knochen": "autospiel",
  "osteoporose_stunde-11-kraft-stabilitaet-osteoporose": "autospiel",
  ruecken_gymnastikstab: "reifenzielwurf",
  ruecken_redondo_ball: "sitzfussball",
  "ruecken_stabilitaet-und-mobilisation": "autospiel",
  "schulter_schulter-mobility": "fang-das-tuch",
  "sitzgymnastik_sitzgymnastik_komplett": "sitzfussball",
};

// --- 7. Thematische Inkohaerenzen fixen ---

// Uebungen die in bestimmten Sessions NICHT zum Thema passen
// Key: Session-ID, Value: Map von Uebungstitel → Ersetzung
const THEMATIC_REPLACEMENTS = {
  "atemtherapie_stunde-06-atemtherapie": {
    // Phase 2: Kraft-Uebungen durch atemtherapeutische ersetzen
    Beckenlift: {
      title: "Atemwelle im Liegen",
      difficulty: "Mittel",
      details: [
        {
          label: "Durchführung",
          value:
            "Rückenlage, Hände auf dem Bauch. Beim Einatmen Bauch heben lassen, beim Ausatmen bewusst den Nabel Richtung Wirbelsäule sinken lassen. Atem langsam wie eine Welle durch den Körper fließen lassen. 2 Minuten.",
        },
        {
          label: "Coaching",
          value:
            "Nicht pressen, den Atem fließen lassen. Bauchdecke weich halten. Atemrhythmus: 4 Takte ein, 6 Takte aus.",
        },
      ],
      kneeAlternative: "Kissen unter die Kniekehlen legen.",
      shoulderAlternative: "Arme neben dem Körper ablegen.",
    },
    "Ausfallschritt zurück": {
      title: "Lippenbremse im Gehen",
      difficulty: "Mittel",
      details: [
        {
          label: "Durchführung",
          value:
            "Langsames Gehen im Raum. Beim Einatmen durch die Nase 3 Schritte, beim Ausatmen durch fast geschlossene Lippen 5 Schritte. 3 Minuten.",
        },
        {
          label: "Coaching",
          value:
            "Lippen nur einen Spalt geöffnet, wie beim Pusten einer Kerze. Ausatmen dauert immer länger als Einatmen.",
        },
      ],
      kneeAlternative:
        "Im Sitzen ausführen: Füße im Takt des Atems heben und senken.",
      shoulderAlternative: "Keine Anpassung nötig.",
    },
    "Planke an der Wand": {
      title: "Zwerchfellatmung im Sitzen",
      difficulty: "Mittel",
      details: [
        {
          label: "Durchführung",
          value:
            "Aufrecht sitzen, eine Hand auf den Brustkorb, andere auf den Bauch. Bewusst in den Bauch atmen (Bauch-Hand hebt sich). 3 Minuten mit wechselnder Handposition.",
        },
        {
          label: "Coaching",
          value:
            "Brustraum bleibt ruhig, nur der Bauch bewegt sich. Einatmen durch die Nase, Ausatmen durch den Mund.",
        },
      ],
      kneeAlternative: "Keine Anpassung nötig (Sitzübung).",
      shoulderAlternative:
        "Hände in den Schoß legen, Atmung nur spüren statt mit Händen kontrollieren.",
    },
    "Armheben mit Widerstand": {
      title: "Atem-Dehnübung Brustkorb",
      difficulty: "Mittel",
      details: [
        {
          label: "Durchführung",
          value:
            "Stand oder Sitz. Beim Einatmen Arme langsam seitlich öffnen und Brustkorb weiten. Beim Ausatmen Arme vor dem Körper zusammenführen und Brustkorb bewusst verengen. 10 Wiederholungen.",
        },
        {
          label: "Coaching",
          value:
            "Armbewegung folgt dem Atem, nicht umgekehrt. Große, ruhige Bewegung. Brustkorb-Öffnung spüren.",
        },
      ],
      kneeAlternative: "Keine Anpassung nötig.",
      shoulderAlternative:
        "Arme nur bis Brusthöhe heben. Kleinerer Bewegungsradius.",
    },
  },

  "faszientraining_stunde-10-faszien-entspannung": {
    // Phase 3: Kraft durch Faszien-Entspannung ersetzen
    "Planke an der Wand": {
      title: "Faszienrolle Rücken",
      slug: "faszienrolle-ruecken",
      difficulty: "Schwer",
      details: [
        {
          label: "Durchführung",
          value:
            "Faszienrolle unter den oberen Rücken legen. Hände hinter dem Kopf, Becken anheben. Langsam vom oberen Rücken bis zur Lendenwirbelsäule rollen. 8 langsame Bahnen.",
        },
        {
          label: "Coaching",
          value:
            "Nie über den Nacken rollen. Bei Schmerzpunkten 10 Sek. verweilen. Druck über die Beine steuern.",
        },
      ],
      kneeAlternative:
        "Becken am Boden lassen, nur mit Armen schieben. Weniger Druck.",
      shoulderAlternative:
        "Arme neben dem Körper statt hinter dem Kopf. Nur den unteren Rückenbereich rollen.",
    },
    Einbeinstand: {
      title: "Myofasziales Stretching Hüfte",
      difficulty: "Schwer",
      details: [
        {
          label: "Durchführung",
          value:
            "Ausfallschrittposition, hinteres Knie auf der Matte. Hüfte langsam nach vorn schieben, Oberkörper aufrecht. 30 Sek. pro Seite, 2 Durchgänge.",
        },
        {
          label: "Coaching",
          value:
            "Dehnung in der Hüftbeuger-Region spüren. Kein Hohlkreuz, Bauchnabel leicht einziehen.",
        },
      ],
      kneeAlternative:
        "Kissen unter das hintere Knie. Oder im Stehen am Stuhl: Ferse zum Gesäß ziehen.",
      shoulderAlternative: "Hände auf die Hüfte statt nach oben strecken.",
    },
  },

  sitzgymnastik_sitzgymnastik_komplett: {
    // Steh-/Liegeuebungen durch sitzende Varianten ersetzen
    "Federndes Wippen": {
      title: "Fußwippen im Sitzen",
      difficulty: "Leicht",
      details: [
        {
          label: "Durchführung",
          value:
            "Aufrecht sitzen, Füße flach auf dem Boden. Abwechselnd Fersen und Zehen heben. 1 Minute rhythmisch wippen.",
        },
        {
          label: "Coaching",
          value:
            "Gleichmäßiger Rhythmus. Erst Fersen hoch, dann Zehen hoch. Wadenmuskulatur bewusst spüren.",
        },
      ],
      kneeAlternative:
        "Nur Zehen heben und senken, Fersen bleiben am Boden.",
      shoulderAlternative: "Keine Anpassung nötig (Sitzübung).",
    },
    "Brücke mit Beckenboden-Spannung": {
      title: "Beckenkippung im Sitzen",
      difficulty: "Schwer",
      details: [
        {
          label: "Durchführung",
          value:
            "Aufrecht sitzen, Füße flach auf dem Boden. Becken langsam nach vorn kippen (Hohlkreuz), dann nach hinten (Rundrücken). Beckenboden bei der Rückwärtskippung anspannen. 10 Wiederholungen.",
        },
        {
          label: "Coaching",
          value:
            "Bewegung kommt nur aus dem Becken, Oberkörper bleibt ruhig. Beckenboden bei der Aufrichtung aktivieren.",
        },
      ],
      kneeAlternative: "Keine Anpassung nötig (Sitzübung).",
      shoulderAlternative: "Keine Anpassung nötig (Sitzübung).",
    },
    "Einbeiniges Stehen mit Gewicht": {
      title: "Beinstrecker im Sitzen",
      difficulty: "Mittel",
      details: [
        {
          label: "Durchführung",
          value:
            "Aufrecht sitzen, Füße auf dem Boden. Ein Bein langsam strecken bis das Knie gerade ist, 3 Sek. halten, langsam senken. 10 Wiederholungen pro Seite.",
        },
        {
          label: "Coaching",
          value:
            "Oberschenkel bleibt auf der Sitzfläche. Fuß anziehen (Flex) beim Strecken. Langsam und kontrolliert.",
        },
      ],
      kneeAlternative:
        "Bein nicht vollständig strecken, nur so weit wie schmerzfrei. Weniger Wiederholungen.",
      shoulderAlternative: "Keine Anpassung nötig (Sitzübung).",
    },
    "Rückenkräftigung Bauchlage": {
      title: "Rückenstreckung im Sitzen",
      difficulty: "Schwer",
      details: [
        {
          label: "Durchführung",
          value:
            "Aufrecht sitzen, Hände auf den Oberschenkeln. Oberkörper langsam nach vorn beugen (gerader Rücken!), dann Wirbel für Wirbel aufrichten. Im aufgerichteten Zustand Schulterblätter zusammenziehen. 8 Wiederholungen.",
        },
        {
          label: "Coaching",
          value:
            "Rücken bleibt gerade beim Vorbeugen - kein Rundrücken. Schulterblätter bewusst zusammendrücken beim Aufrichten.",
        },
      ],
      kneeAlternative: "Keine Anpassung nötig (Sitzübung).",
      shoulderAlternative:
        "Hände im Schoß lassen statt auf den Oberschenkeln. Nur Rumpf bewegen.",
    },
  },
};

// Beckenboden Phase 3 und Redondo-Ball werden gesondert behandelt
const BECKENBODEN_PHASE3_REPLACEMENTS = {
  "Planke an der Wand": {
    title: "Beckenboden-Brücke intensiv",
    difficulty: "Schwer",
    details: [
      {
        label: "Durchführung",
        value:
          "Rückenlage, Füße aufgestellt. Beckenboden fest anspannen, Becken heben. Oben: 3× Beckenboden pulsierend anspannen und lösen. Langsam abrollen. 8 Wiederholungen.",
      },
      {
        label: "Coaching",
        value:
          "Beckenboden-Spannung über die gesamte Brückenposition halten. Pulsierende Impulse deutlich spürbar machen.",
      },
    ],
    kneeAlternative:
      "Füße weiter vom Körper aufstellen. Nur kleine Beckenbewegung.",
    shoulderAlternative: "Arme neben dem Körper ablegen.",
  },
  Einbeinstand: {
    title: "Beckenboden im Vierfüßlerstand",
    difficulty: "Schwer",
    details: [
      {
        label: "Durchführung",
        value:
          "Vierfüßlerstand. Beckenboden anspannen, dann rechten Arm und linkes Bein langsam strecken. 5 Sek. halten. Seite wechseln. 6 Wiederholungen pro Seite.",
      },
      {
        label: "Coaching",
        value:
          "Beckenboden die gesamte Zeit aktiv halten. Rücken bleibt gerade, kein Durchhängen.",
      },
    ],
    kneeAlternative:
      "Nur einen Arm strecken, Knie bleiben am Boden. Weiche Unterlage fürs Knie.",
    shoulderAlternative:
      "Nur ein Bein strecken, Hände bleiben am Boden.",
  },
  "Kreuzheben mit Wasserflasche": {
    title: "Beckenboden-Impulse im Stand",
    difficulty: "Schwer",
    details: [
      {
        label: "Durchführung",
        value:
          "Aufrechter Stand, Füße hüftbreit. Beckenboden schnell anspannen und lösen (Impulse). 10× schnell, dann 10 Sek. Daueranspannung. 3 Durchgänge.",
      },
      {
        label: "Coaching",
        value:
          "Schnelle Impulse trainieren die Reflexkraft. Daueranspannung trainiert die Haltefähigkeit. Beides ist wichtig.",
      },
    ],
    kneeAlternative: "Im Sitzen ausführen für mehr Stabilität.",
    shoulderAlternative: "Keine Anpassung nötig.",
  },
};

const REDONDO_BALL_REPLACEMENTS = {
  "Faszienrolle Oberschenkel": {
    title: "Ball-Rolle Oberschenkel",
    difficulty: "Mittel",
    details: [
      {
        label: "Durchführung",
        value:
          "Sitzen, Redondo-Ball unter den Oberschenkel legen. Bein langsam strecken und beugen, Ball rollt dabei unter dem Oberschenkel. 10 Wiederholungen pro Seite.",
      },
      {
        label: "Coaching",
        value:
          "Langsam rollen, bei Verspannungen verweilen. Druck über das Körpergewicht steuern.",
      },
    ],
    kneeAlternative:
      "Bein nicht vollständig strecken. Ball weiter Richtung Gesäß positionieren.",
    shoulderAlternative: "Keine Anpassung nötig.",
  },
  "Armheben mit Widerstand": {
    title: "Ball-Squeeze Schulter",
    difficulty: "Mittel",
    details: [
      {
        label: "Durchführung",
        value:
          "Stand, Redondo-Ball zwischen den Handflächen auf Brusthöhe. Ball 5 Sek. fest zusammendrücken, dann lösen. 10 Wiederholungen. Dann: Ball über Kopf heben und drücken.",
      },
      {
        label: "Coaching",
        value:
          "Schultern bleiben unten beim Drücken. Arme nicht durchstrecken. Gleichmäßig atmen.",
      },
    ],
    kneeAlternative: "Im Sitzen ausführen.",
    shoulderAlternative:
      "Ball nur auf Brusthöhe drücken, nicht über Kopf. Kleinerer Druck.",
  },
  "Spiraldynamische Rotation": {
    title: "Ball-Rotation Rumpf",
    difficulty: "Schwer",
    details: [
      {
        label: "Durchführung",
        value:
          "Stand, Ball mit beiden Händen vor der Brust. Oberkörper langsam nach rechts und links rotieren, Ball mitnehmen. 10 Rotationen pro Seite.",
      },
      {
        label: "Coaching",
        value:
          "Becken bleibt stabil nach vorn. Rotation kommt aus der Brustwirbelsäule. Ball als Fokuspunkt nutzen.",
      },
    ],
    kneeAlternative: "Im Sitzen ausführen.",
    shoulderAlternative:
      "Ball tiefer halten (Bauchhöhe). Nur kleiner Rotationswinkel.",
  },
};

// --- Verarbeitung ---

function processSession(session) {
  const sessionId = session.id;
  const phases = session.phases || [];
  const changes = [];

  const improvedPhases = phases.map((phase, phaseIdx) => {
    let exercises = (phase.exercises || []).map((ex) => {
      const improved = { ...ex };

      // 1. Alternativen kuerzen
      if (improved.kneeAlternative) {
        const cleaned = removeEmojis(improved.kneeAlternative);
        const shortened = shortenAlternative(cleaned);
        if (shortened !== improved.kneeAlternative) {
          changes.push(
            `  [${phase.title}] ${ex.title}: kneeAlt gekuerzt (${improved.kneeAlternative.length} → ${shortened.length} Zeichen)`,
          );
          improved.kneeAlternative = shortened;
        }
      }
      if (improved.shoulderAlternative) {
        const cleaned = removeEmojis(improved.shoulderAlternative);
        const shortened = shortenAlternative(cleaned);
        if (shortened !== improved.shoulderAlternative) {
          changes.push(
            `  [${phase.title}] ${ex.title}: shoulderAlt gekuerzt (${improved.shoulderAlternative.length} → ${shortened.length} Zeichen)`,
          );
          improved.shoulderAlternative = shortened;
        }
      }

      // 3. Difficulty korrigieren
      const fixedDifficulty = fixDifficulty(
        ex.title,
        improved.difficulty,
      );
      if (fixedDifficulty !== improved.difficulty) {
        changes.push(
          `  [${phase.title}] ${ex.title}: Difficulty ${improved.difficulty} → ${fixedDifficulty}`,
        );
        improved.difficulty = fixedDifficulty;
      }

      // 4. Boilerplate-Durchfuehrung ersetzen
      const newDetails = replaceBoilerplate(improved);
      if (JSON.stringify(newDetails) !== JSON.stringify(improved.details)) {
        changes.push(
          `  [${phase.title}] ${ex.title}: Durchführung → konkrete Anleitung`,
        );
        improved.details = newDetails;
      }

      // 5. Coaching-Cues ersetzen
      const newCues = replaceCoachingCue(improved);
      if (JSON.stringify(newCues) !== JSON.stringify(improved.details)) {
        changes.push(
          `  [${phase.title}] ${ex.title}: Coaching → übungsspezifisch`,
        );
        improved.details = newCues;
      }

      return improved;
    });

    // 7. Thematische Inkohaerenzen fixen
    const sessionReplacements = THEMATIC_REPLACEMENTS[sessionId];
    if (sessionReplacements) {
      exercises = exercises.map((ex) => {
        const replacement = sessionReplacements[ex.title];
        if (replacement) {
          changes.push(
            `  [${phase.title}] ERSETZT: "${ex.title}" → "${replacement.title}"`,
          );
          return { ...replacement };
        }
        return ex;
      });
    }

    // Beckenboden Phase 3 Fixes
    if (
      sessionId === "beckenboden_stunde-09-beckenboden-power" &&
      phase.title.toLowerCase().includes("schwerpunkt")
    ) {
      exercises = exercises.map((ex) => {
        const replacement = BECKENBODEN_PHASE3_REPLACEMENTS[ex.title];
        if (replacement) {
          changes.push(
            `  [${phase.title}] ERSETZT: "${ex.title}" → "${replacement.title}"`,
          );
          return { ...replacement };
        }
        return ex;
      });
    }

    // Redondo-Ball Phase 2+3 Fixes
    if (sessionId === "ruecken_redondo_ball") {
      const phaseTitle = phase.title.toLowerCase();
      if (
        phaseTitle.includes("hauptteil") ||
        phaseTitle.includes("schwerpunkt") ||
        phaseTitle.includes("phase 2") ||
        phaseTitle.includes("phase 3")
      ) {
        exercises = exercises.map((ex) => {
          const replacement = REDONDO_BALL_REPLACEMENTS[ex.title];
          if (replacement) {
            changes.push(
              `  [${phase.title}] ERSETZT: "${ex.title}" → "${replacement.title}"`,
            );
            return { ...replacement };
          }
          return ex;
        });
      }
    }

    // 6. Spiel in Phase 1 einfuegen (nur wenn noch kein Spiel vorhanden)
    const isPhase1 =
      phaseIdx === 0 ||
      phase.title.toLowerCase().includes("aufwärm") ||
      phase.title.toLowerCase().includes("aufwaerm") ||
      phase.title.toLowerCase().includes("phase 1");

    if (isPhase1) {
      const hasGame = exercises.some((ex) => ex.isGame);
      const gameKey = SESSION_GAME_MAP[sessionId];
      if (!hasGame && gameKey && GAME_DEFINITIONS[gameKey]) {
        const game = { ...GAME_DEFINITIONS[gameKey] };
        // Spiel als zweite Uebung in Phase 1 einfuegen (nach der ersten Mobilisierung)
        exercises.splice(1, 0, game);
        changes.push(
          `  [${phase.title}] SPIEL EINGEFUEGT: "${game.title}" (Position 2)`,
        );
      }
    }

    return {
      title: phase.title,
      description: phase.description || undefined,
      exercises,
    };
  });

  return { phases: improvedPhases, changes };
}

// --- Main ---

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(
    dryRun
      ? "=== DRY RUN (Qualitative Ueberarbeitung) ==="
      : "=== LIVE UPDATE (Qualitative Ueberarbeitung) ===",
  );

  const token = await getToken();

  const sessionDocs = await fetchCollection("sessions", token);
  const sessions = sessionDocs.map((doc) => ({
    id: getDocId(doc.name),
    ...parseFields(doc.fields),
  }));

  console.log(`Sessions geladen: ${sessions.length}\n`);

  let totalUpdated = 0;
  let totalChanges = 0;

  for (const session of sessions) {
    if (session.status !== "published") {
      console.log(`SKIP: ${session.title} (Status: ${session.status})`);
      continue;
    }

    const { phases, changes } = processSession(session);

    if (changes.length === 0) {
      console.log(`${session.title}: Keine Aenderungen noetig`);
      continue;
    }

    console.log(`\n${session.title}: ${changes.length} Aenderungen`);
    for (const change of changes) {
      console.log(change);
    }

    totalChanges += changes.length;

    if (!dryRun) {
      await updateSession(session.id, phases, token);
      console.log(`  -> AKTUALISIERT`);
      totalUpdated++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(
    dryRun
      ? `Dry-Run: ${totalChanges} Aenderungen in ${sessions.length} Sessions identifiziert.`
      : `${totalUpdated} Sessions aktualisiert (${totalChanges} Aenderungen).`,
  );
}

main().catch((err) => {
  console.error("FEHLER:", err.message);
  process.exit(1);
});
