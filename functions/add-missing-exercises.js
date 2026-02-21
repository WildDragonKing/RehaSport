// Fehlende Uebungen in der Exercises-Collection anlegen
// und Slugs in den Sessions setzen
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
        if ("integerValue" in v) return Number(v.integerValue);
        return null;
      });
    else result[key] = null;
  }
  return result;
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

async function fetchCollection(name, token) {
  const docs = [];
  let pageToken = null;
  do {
    let url = `${BASE}/${name}?pageSize=100`;
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

// --- Neue Uebungen fuer die Bibliothek ---

const NEW_EXERCISES = [
  // === SPIELE ===
  {
    slug: "spiel-verkehrsampelspiel",
    title: "Verkehrsampelspiel",
    difficulty: "Leicht",
    area: "Koordination",
    tags: ["spiel", "aufwaermen", "reaktion", "gruppe"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Alle bewegen sich frei im Raum. Spielleiter zeigt Farbkarten: Grün = Gehen, Gelb = Langsam gehen, Rot = Stopp und kleine Übung (z.B. 3x Kniebeuge). 5 Minuten.",
      },
      {
        title: "Varianten",
        content:
          "Bei Rot themenpassende Übungen einbauen: Atemübung, Beckenboden anspannen, Balance halten. Oder: Farben durch Zahlen ersetzen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Bei Rot: Armbewegungen statt Kniebeugen. Tempo reduzieren.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Arme locker hängen lassen. Stopp-Übungen ohne Armheben wählen.",
    },
    contraindications: ["Bei akutem Schwindel nicht geeignet"],
  },
  {
    slug: "spiel-autospiel",
    title: "Autospiel",
    difficulty: "Leicht",
    area: "Ausdauer",
    tags: ["spiel", "aufwaermen", "ausdauer", "tempo"],
    sections: [
      {
        title: "Ausführung",
        content:
          'Alle bewegen sich im Raum. Spielleiter nennt den "Gang": 1. Gang = langsam gehen, 2. Gang = normales Tempo, 3. Gang = schnelles Gehen, R = rückwärts gehen.',
      },
      {
        title: "Varianten",
        content:
          "Hupen (klatschen) als Signal zum Richtungswechsel. Für Osteoporose: bei Rot kräftig stampfen (Knochenbelastung).",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Nur 1. und 2. Gang nutzen. Kein schnelles Gehen, stattdessen große Schritte.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Keine Anpassung nötig.",
    },
    contraindications: [
      "Bei Gleichgewichtsstörungen: nur 1. und 2. Gang, kein Rückwärtsgang",
    ],
  },
  {
    slug: "spiel-sitzfussball",
    title: "Sitzfußball",
    difficulty: "Leicht",
    area: "Koordination",
    tags: ["spiel", "aufwaermen", "beine", "gruppe", "sitzend"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Stühle im Kreis mit 1m Abstand. Softball in die Mitte. Nur mit Füßen spielen, Ball maximal kniehoch. Zwei Mannschaften, Tor = zwischen zwei markierten Stühlen.",
      },
      {
        title: "Varianten",
        content:
          "Mit Pezziball oder Redondo-Ball spielen. Barfuß für mehr Fußmotorik. Zwei Bälle gleichzeitig für Fortgeschrittene.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Ball mit der Fußinnenseite schieben statt schießen. Knie bleibt in Ruheposition.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Keine Anpassung nötig - Arme werden nicht gebraucht.",
    },
    contraindications: [],
  },
  {
    slug: "spiel-ziffern-und-bewegung",
    title: "Ziffern und Bewegung",
    difficulty: "Leicht",
    area: "Koordination",
    tags: ["spiel", "aufwaermen", "gedaechtnis", "dual-task"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Zahlen werden Bewegungen zugeordnet: 1 = Arme strecken, 2 = Bein heben, 3 = Schultern kreisen, 4 = auf der Stelle marschieren. Bei Zahlenaufruf führen alle die Bewegung aus.",
      },
      {
        title: "Varianten",
        content:
          "Mit 3 Zahlen starten, auf 5-6 steigern. Tempo erhöhen. Zahlenkombinationen ansagen (z.B. 2-4-1).",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Bein heben durch Fußwippen ersetzen. Alle Übungen im Sitzen möglich.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Arme strecken durch Hände öffnen/schließen ersetzen. Nur schmerzfreien Radius nutzen.",
    },
    contraindications: [],
  },
  {
    slug: "spiel-fang-das-tuch",
    title: "Fang das Tuch",
    difficulty: "Leicht",
    area: "Koordination",
    tags: ["spiel", "aufwaermen", "reaktion", "schulter"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Alle stehen im Kreis, jeder hält ein Jongliertuch. Auf Kommando: Tuch nach rechts werfen, Tuch von links fangen.",
      },
      {
        title: "Varianten",
        content:
          "Rhythmus langsam aufbauen. Erst einzeln üben, dann im Kreis. Für Schulter-Gruppen: Tücher nur auf Hüfthöhe.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Im Sitzen ausführen. Tücher nur seitlich weiterreichen statt werfen.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Tücher nur auf Hüfthöhe werfen. Mit der schmerzfreien Hand werfen.",
    },
    contraindications: ["Material: Jongliertücher benötigt"],
  },
  {
    slug: "spiel-reifenzielwurf",
    title: "Reifenzielwurf",
    difficulty: "Leicht",
    area: "Koordination",
    tags: ["spiel", "aufwaermen", "wurf", "konzentration"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Spielleiter hält Reifen auf Hüfthöhe. Teilnehmer werfen aus 2-3m Entfernung Softbälle durch den Reifen. Jeder 3 Versuche.",
      },
      {
        title: "Varianten",
        content:
          "Entfernung variieren. Mit Stab statt Ball werfen (Gymnastikstab-Stunde). Teams bilden und Punkte zählen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description: "Im Sitzen werfen. Entfernung verkürzen.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Unterhandwurf mit der schmerzfreien Hand. Reifen tiefer halten.",
    },
    contraindications: ["Material: Gymnastikreifen und Softbälle benötigt"],
  },

  // === ATEMTHERAPIE-UEBUNGEN ===
  {
    slug: "lippenbremse-im-gehen",
    title: "Lippenbremse im Gehen",
    difficulty: "Mittel",
    area: "Flexibilität",
    tags: ["atemtherapie", "gehen", "lippenbremse"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Langsames Gehen im Raum. Beim Einatmen durch die Nase 3 Schritte, beim Ausatmen durch fast geschlossene Lippen 5 Schritte.",
      },
      {
        title: "Tipps",
        content:
          "Lippen nur einen Spalt geöffnet, wie beim Pusten einer Kerze. Ausatmen dauert immer länger als Einatmen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Im Sitzen ausführen: Füße im Takt des Atems heben und senken.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Keine Anpassung nötig.",
    },
    contraindications: ["Bei Hyperventilationsneigung: kürzere Atempausen"],
  },
  {
    slug: "atemwelle-im-liegen",
    title: "Atemwelle im Liegen",
    difficulty: "Mittel",
    area: "Flexibilität",
    tags: ["atemtherapie", "entspannung", "bauchatmung"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Rückenlage, Hände auf dem Bauch. Beim Einatmen Bauch heben lassen, beim Ausatmen bewusst den Nabel Richtung Wirbelsäule sinken lassen. Atem wie eine Welle fließen lassen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description: "Kissen unter die Kniekehlen legen.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Arme neben dem Körper ablegen.",
    },
    contraindications: [],
  },
  {
    slug: "zwerchfellatmung-im-sitzen",
    title: "Zwerchfellatmung im Sitzen",
    difficulty: "Mittel",
    area: "Flexibilität",
    tags: ["atemtherapie", "zwerchfell", "sitzend"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Aufrecht sitzen, eine Hand auf den Brustkorb, andere auf den Bauch. Bewusst in den Bauch atmen (Bauch-Hand hebt sich). 3 Minuten.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description: "Keine Anpassung nötig (Sitzübung).",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Hände in den Schoß legen, Atmung nur spüren statt mit Händen kontrollieren.",
    },
    contraindications: [],
  },
  {
    slug: "atem-dehnuebung-brustkorb",
    title: "Atem-Dehnübung Brustkorb",
    difficulty: "Mittel",
    area: "Flexibilität",
    tags: ["atemtherapie", "dehnung", "brustkorb"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Beim Einatmen Arme seitlich öffnen und Brustkorb weiten. Beim Ausatmen Arme vor dem Körper zusammenführen und Brustkorb bewusst verengen. 10 Wiederholungen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description: "Keine Anpassung nötig.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Arme nur bis Brusthöhe heben. Kleinerer Bewegungsradius.",
    },
    contraindications: [],
  },

  // === BECKENBODEN-UEBUNGEN ===
  {
    slug: "beckenboden-bruecke-intensiv",
    title: "Beckenboden-Brücke intensiv",
    difficulty: "Schwer",
    area: "Stärkung",
    tags: ["beckenboden", "bruecke", "kraft"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Rückenlage, Füße aufgestellt. Beckenboden fest anspannen, Becken heben. Oben: 3× pulsierend anspannen und lösen. Langsam abrollen. 8 Wiederholungen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Füße weiter vom Körper aufstellen. Nur kleine Beckenbewegung.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Arme neben dem Körper ablegen.",
    },
    contraindications: [
      "Nicht bei akuten Rückenschmerzen im Lendenbereich",
    ],
  },
  {
    slug: "beckenboden-im-vierfuesslerstand",
    title: "Beckenboden im Vierfüßlerstand",
    difficulty: "Schwer",
    area: "Stärkung",
    tags: ["beckenboden", "vierfuessler", "stabilisation"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Vierfüßlerstand. Beckenboden anspannen, dann rechten Arm und linkes Bein langsam strecken. 5 Sek. halten. Seite wechseln. 6 Wiederholungen pro Seite.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Nur Arm strecken, Knie am Boden. Weiche Unterlage fürs Knie.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Nur Bein strecken, Hände bleiben am Boden.",
    },
    contraindications: [],
  },
  {
    slug: "beckenboden-impulse-im-stand",
    title: "Beckenboden-Impulse im Stand",
    difficulty: "Schwer",
    area: "Stärkung",
    tags: ["beckenboden", "impulse", "reflexkraft"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Aufrechter Stand, Füße hüftbreit. Beckenboden schnell anspannen und lösen (Impulse). 10× schnell, dann 10 Sek. Daueranspannung. 3 Durchgänge.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description: "Im Sitzen ausführen für mehr Stabilität.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Keine Anpassung nötig.",
    },
    contraindications: [],
  },

  // === SITZGYMNASTIK ===
  {
    slug: "fusswippen-im-sitzen",
    title: "Fußwippen im Sitzen",
    difficulty: "Leicht",
    area: "Koordination",
    tags: ["sitzgymnastik", "fuesse", "mobilisation"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Aufrecht sitzen, Füße flach auf dem Boden. Abwechselnd Fersen und Zehen heben. 1 Minute rhythmisch wippen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Nur Zehen heben und senken, Fersen bleiben am Boden.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Keine Anpassung nötig (Sitzübung).",
    },
    contraindications: [],
  },
  {
    slug: "beckenkippung-im-sitzen",
    title: "Beckenkippung im Sitzen",
    difficulty: "Schwer",
    area: "Stärkung",
    tags: ["sitzgymnastik", "becken", "beckenboden"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Aufrecht sitzen, Füße flach auf dem Boden. Becken langsam nach vorn kippen (Hohlkreuz), dann nach hinten (Rundrücken). Beckenboden bei der Rückwärtskippung anspannen. 10 Wiederholungen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description: "Keine Anpassung nötig (Sitzübung).",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Keine Anpassung nötig (Sitzübung).",
    },
    contraindications: [],
  },
  {
    slug: "beinstrecker-im-sitzen",
    title: "Beinstrecker im Sitzen",
    difficulty: "Mittel",
    area: "Stärkung",
    tags: ["sitzgymnastik", "beine", "kraft"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Aufrecht sitzen. Ein Bein langsam strecken bis das Knie gerade ist, 3 Sek. halten, langsam senken. 10 Wiederholungen pro Seite.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Bein nicht vollständig strecken, nur so weit wie schmerzfrei.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Keine Anpassung nötig (Sitzübung).",
    },
    contraindications: [],
  },
  {
    slug: "rueckenstreckung-im-sitzen",
    title: "Rückenstreckung im Sitzen",
    difficulty: "Schwer",
    area: "Stärkung",
    tags: ["sitzgymnastik", "ruecken", "kraft"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Aufrecht sitzen. Oberkörper langsam nach vorn beugen (gerader Rücken!), dann Wirbel für Wirbel aufrichten. Im aufgerichteten Zustand Schulterblätter zusammenziehen. 8 Wiederholungen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description: "Keine Anpassung nötig (Sitzübung).",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Hände im Schoß lassen. Nur Rumpf bewegen.",
    },
    contraindications: [],
  },

  // === FASZIEN ===
  {
    slug: "faszienrolle-ruecken",
    title: "Faszienrolle Rücken",
    difficulty: "Schwer",
    area: "Flexibilität",
    tags: ["faszien", "rolle", "ruecken", "selbstmassage"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Faszienrolle unter den oberen Rücken. Hände hinter dem Kopf, Becken anheben. Langsam vom oberen Rücken bis Lendenwirbelsäule rollen. 8 Bahnen.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Becken am Boden lassen, nur mit Armen schieben. Weniger Druck.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Arme neben dem Körper statt hinter dem Kopf. Nur unteren Rückenbereich.",
    },
    contraindications: [
      "Nie über den Nacken rollen",
      "Nicht bei Osteoporose im Wirbelbereich",
    ],
  },
  {
    slug: "myofasziales-stretching-huefte",
    title: "Myofasziales Stretching Hüfte",
    difficulty: "Schwer",
    area: "Flexibilität",
    tags: ["faszien", "dehnung", "huefte", "hueftbeuger"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Ausfallschrittposition, hinteres Knie auf der Matte. Hüfte langsam nach vorn schieben, Oberkörper aufrecht. 30 Sek. pro Seite, 2 Durchgänge.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Kissen unter das hintere Knie. Oder im Stehen am Stuhl: Ferse zum Gesäß ziehen.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Hände auf die Hüfte statt nach oben strecken.",
    },
    contraindications: [
      "Bei Hüft-TEP: nur im schmerzfreien Bereich, keine Überstreckung",
    ],
  },

  // === REDONDO-BALL ===
  {
    slug: "ball-rolle-oberschenkel",
    title: "Ball-Rolle Oberschenkel",
    difficulty: "Mittel",
    area: "Flexibilität",
    tags: ["redondo-ball", "beine", "selbstmassage"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Sitzen, Redondo-Ball unter den Oberschenkel. Bein langsam strecken und beugen, Ball rollt dabei. 10 Wiederholungen pro Seite.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description:
        "Bein nicht vollständig strecken. Ball weiter Richtung Gesäß.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description: "Keine Anpassung nötig.",
    },
    contraindications: [],
  },
  {
    slug: "ball-squeeze-schulter",
    title: "Ball-Squeeze Schulter",
    difficulty: "Mittel",
    area: "Stärkung",
    tags: ["redondo-ball", "schulter", "kraft"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Redondo-Ball zwischen den Handflächen auf Brusthöhe. Ball 5 Sek. fest zusammendrücken, dann lösen. 10 Wiederholungen. Dann: Ball über Kopf heben und drücken.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description: "Im Sitzen ausführen.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Ball nur auf Brusthöhe drücken, nicht über Kopf.",
    },
    contraindications: [],
  },
  {
    slug: "ball-rotation-rumpf",
    title: "Ball-Rotation Rumpf",
    difficulty: "Schwer",
    area: "Koordination",
    tags: ["redondo-ball", "rotation", "rumpf"],
    sections: [
      {
        title: "Ausführung",
        content:
          "Stand, Ball mit beiden Händen vor der Brust. Oberkörper langsam nach rechts und links rotieren, Ball mitnehmen. 10 Rotationen pro Seite.",
      },
    ],
    kneeAlternative: {
      title: "Knie-Alternative",
      description: "Im Sitzen ausführen.",
    },
    shoulderAlternative: {
      title: "Schulter-Alternative",
      description:
        "Ball tiefer halten (Bauchhöhe). Nur kleiner Rotationswinkel.",
    },
    contraindications: [],
  },
];

// Slug-Titel-Map fuer Session-Matching
function buildTitleToSlugMap(exercises) {
  const map = new Map();
  for (const ex of exercises) {
    map.set(ex.title.toLowerCase(), ex.slug);
  }
  return map;
}

async function createExercise(exercise, token) {
  const docId = exercise.slug;
  const url = `${BASE}/exercises/${docId}`;

  const fields = {};
  for (const [key, val] of Object.entries(exercise)) {
    if (val !== undefined) {
      fields[key] = toFirestoreValue(val);
    }
  }

  const resp = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(
      `Create ${docId} fehlgeschlagen: ${resp.status} ${err}`,
    );
  }
}

async function updateSessionSlugs(sessionId, phases, token) {
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

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(
    dryRun
      ? "=== DRY RUN (Exercises anlegen + Slugs setzen) ==="
      : "=== LIVE (Exercises anlegen + Slugs setzen) ===",
  );

  const token = await getToken();

  // 1. Bestehende Exercises laden
  const existingDocs = await fetchCollection("exercises", token);
  const existingSlugs = new Set(
    existingDocs.map((doc) => doc.name.split("/").pop()),
  );
  console.log(`Bestehende Exercises: ${existingSlugs.size}`);

  // 2. Neue Exercises anlegen
  const titleToSlug = buildTitleToSlugMap(NEW_EXERCISES);
  let created = 0;

  for (const exercise of NEW_EXERCISES) {
    if (existingSlugs.has(exercise.slug)) {
      console.log(`  SKIP: ${exercise.slug} (existiert bereits)`);
      continue;
    }

    console.log(`  NEU: ${exercise.slug} - "${exercise.title}"`);
    if (!dryRun) {
      await createExercise(exercise, token);
    }
    created++;
  }
  console.log(`\n${created} neue Exercises ${dryRun ? "wuerden angelegt" : "angelegt"}\n`);

  // 3. Sessions laden und Slugs setzen
  const sessionDocs = await fetchCollection("sessions", token);
  let slugsSet = 0;
  let sessionsUpdated = 0;

  for (const doc of sessionDocs) {
    const session = parseFields(doc.fields);
    const sessionId = doc.name.split("/").pop();
    if (session.status !== "published") continue;

    let changed = false;
    const phases = (session.phases || []).map((phase) => {
      const exercises = (phase.exercises || []).map((ex) => {
        if (ex.slug) return ex;

        const slug = titleToSlug.get(ex.title.toLowerCase());
        if (slug) {
          console.log(
            `  [${session.title}] ${ex.title} → slug: ${slug}`,
          );
          slugsSet++;
          changed = true;
          return { ...ex, slug };
        }
        return ex;
      });
      return { ...phase, exercises };
    });

    if (changed) {
      if (!dryRun) {
        await updateSessionSlugs(sessionId, phases, token);
      }
      sessionsUpdated++;
    }
  }

  console.log(
    `\n${slugsSet} Slugs ${dryRun ? "wuerden gesetzt" : "gesetzt"} in ${sessionsUpdated} Sessions`,
  );
}

main().catch((err) => {
  console.error("FEHLER:", err.message);
  process.exit(1);
});
