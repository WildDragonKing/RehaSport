import JSZip from "jszip";
import { saveAs } from "file-saver";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./config";

export interface ExportResult {
  success: boolean;
  collections: { name: string; count: number }[];
  error?: string;
}

/**
 * Export all Firestore data as a ZIP file
 */
export async function exportFirestoreData(): Promise<ExportResult> {
  const zip = new JSZip();
  const collections: { name: string; count: number }[] = [];

  const collectionNames = [
    "sessions",
    "exercises",
    "groups",
    "drafts",
    "users",
    "invitations",
    "config",
  ];

  try {
    for (const collName of collectionNames) {
      const collRef = collection(db, collName);
      const snapshot = await getDocs(collRef);

      if (snapshot.empty) {
        continue;
      }

      const docs: Record<string, unknown>[] = [];
      snapshot.forEach((doc) => {
        docs.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Add to zip as JSON file
      zip.file(`${collName}.json`, JSON.stringify(docs, null, 2));
      collections.push({ name: collName, count: docs.length });
    }

    // Add metadata
    const metadata = {
      exportedAt: new Date().toISOString(),
      collections: collections,
      totalDocuments: collections.reduce((sum, c) => sum + c.count, 0),
    };
    zip.file("_metadata.json", JSON.stringify(metadata, null, 2));

    // Generate and download
    const content = await zip.generateAsync({ type: "blob" });
    const timestamp = new Date().toISOString().split("T")[0];
    saveAs(content, `rehasport-backup-${timestamp}.zip`);

    return { success: true, collections };
  } catch (error) {
    return {
      success: false,
      collections,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
}
