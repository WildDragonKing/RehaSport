import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  type Timestamp,
} from "firebase/firestore";

import { getDb } from "./firebase";
import type { SessionPhase, SessionVersion } from "./types";

// Alle Versionen einer Session laden (neueste zuerst)
export async function getSessionVersions(
  sessionId: string,
): Promise<SessionVersion[]> {
  const db = getDb();
  const versionsRef = collection(db, "sessions", sessionId, "versions");
  const versionsQuery = query(versionsRef, orderBy("versionNumber", "desc"));
  const snap = await getDocs(versionsQuery);

  return snap.docs.map((versionDoc) => {
    const data = versionDoc.data();
    const changedAt = data.changedAt as Timestamp | undefined;

    return {
      id: versionDoc.id,
      versionNumber:
        typeof data.versionNumber === "number" ? data.versionNumber : 0,
      changedBy: typeof data.changedBy === "string" ? data.changedBy : "",
      changedByName:
        typeof data.changedByName === "string" ? data.changedByName : undefined,
      changedAt: changedAt?.toDate?.() ?? new Date(),
      changeNote:
        typeof data.changeNote === "string" ? data.changeNote : "Keine Notiz",
      snapshot: {
        title:
          typeof data.snapshot?.title === "string"
            ? data.snapshot.title
            : "Unbekannt",
        description:
          typeof data.snapshot?.description === "string"
            ? data.snapshot.description
            : undefined,
        phases: Array.isArray(data.snapshot?.phases)
          ? data.snapshot.phases
          : [],
      },
    };
  });
}

// Aktuelle Session als Version sichern und dann mit neuem Snapshot ueberschreiben
export async function restoreVersion(
  sessionId: string,
  version: SessionVersion,
  userId: string,
  userName: string,
): Promise<void> {
  const db = getDb();
  const sessionRef = doc(db, "sessions", sessionId);

  await runTransaction(db, async (transaction) => {
    const sessionSnap = await transaction.get(sessionRef);
    if (!sessionSnap.exists()) {
      throw new Error("Session nicht gefunden.");
    }

    const currentData = sessionSnap.data();

    // Versionsnummer transaktional aus Session-Counter bestimmen
    const lastVersion =
      typeof currentData.versionCount === "number"
        ? currentData.versionCount
        : 0;
    const nextVersion = lastVersion + 1;

    // Aktuellen Stand als Version sichern
    const versionsRef = collection(db, "sessions", sessionId, "versions");
    const backupRef = doc(versionsRef);
    transaction.set(backupRef, {
      versionNumber: nextVersion,
      changedBy: userId,
      changedByName: userName,
      changedAt: new Date(),
      changeNote: `Automatisches Backup vor Wiederherstellung von Version ${version.versionNumber}`,
      snapshot: {
        title: currentData.title ?? "",
        description: currentData.description ?? "",
        phases: currentData.phases ?? [],
      },
    });

    // Session mit dem alten Snapshot ueberschreiben + Counter aktualisieren
    const updatedPhases: SessionPhase[] = version.snapshot.phases;
    transaction.update(sessionRef, {
      title: version.snapshot.title,
      description: version.snapshot.description ?? "",
      phases: updatedPhases,
      versionCount: nextVersion,
      updatedAt: new Date(),
      updatedBy: userId,
    });
  });
}

// Aktuelle Session als neue Version sichern (vor manueller Bearbeitung)
export async function saveCurrentAsVersion(
  sessionId: string,
  userId: string,
  userName: string,
  changeNote: string,
): Promise<void> {
  const db = getDb();
  const sessionRef = doc(db, "sessions", sessionId);

  await runTransaction(db, async (transaction) => {
    const sessionSnap = await transaction.get(sessionRef);
    if (!sessionSnap.exists()) {
      throw new Error("Session nicht gefunden.");
    }

    const data = sessionSnap.data();

    // Versionsnummer transaktional aus Session-Counter bestimmen
    const lastVersion =
      typeof data.versionCount === "number" ? data.versionCount : 0;
    const nextVersion = lastVersion + 1;

    const versionsRef = collection(db, "sessions", sessionId, "versions");
    const versionRef = doc(versionsRef);
    transaction.set(versionRef, {
      versionNumber: nextVersion,
      changedBy: userId,
      changedByName: userName,
      changedAt: new Date(),
      changeNote,
      snapshot: {
        title: data.title ?? "",
        description: data.description ?? "",
        phases: data.phases ?? [],
      },
    });

    // Counter auf Session-Dokument aktualisieren
    transaction.update(sessionRef, { versionCount: nextVersion });
  });
}
