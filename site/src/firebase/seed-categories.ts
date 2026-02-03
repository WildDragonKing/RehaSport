import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

interface SessionData {
  category: string;
  categoryTitle?: string;
  title: string;
  focus?: string;
}

interface CategoryData {
  slug: string;
  title: string;
  description: string;
  order: number;
  createdAt: number;
}

/**
 * Extract categories from existing sessions and create them in the categories collection
 */
export async function seedCategoriesFromSessions(): Promise<{
  created: string[];
  existing: string[];
  errors: string[];
}> {
  const created: string[] = [];
  const existing: string[] = [];
  const errors: string[] = [];

  try {
    // Get all sessions
    const sessionsSnapshot = await getDocs(collection(db, "sessions"));
    const categoryMap = new Map<
      string,
      { title: string; focuses: Set<string> }
    >();

    // Extract unique categories
    sessionsSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as SessionData;
      if (!data.category) return;

      const slug = data.category;
      const title = data.categoryTitle || humanizeSlug(slug);

      if (!categoryMap.has(slug)) {
        categoryMap.set(slug, { title, focuses: new Set() });
      }

      // Collect focus tags
      if (data.focus) {
        data.focus.split(",").forEach((f) => {
          const trimmed = f.trim();
          if (trimmed) {
            categoryMap.get(slug)!.focuses.add(trimmed);
          }
        });
      }
    });

    console.log(
      `Found ${categoryMap.size} unique categories from ${sessionsSnapshot.docs.length} sessions`,
    );

    // Create category documents
    let order = 0;
    for (const [slug, { title, focuses }] of categoryMap) {
      try {
        const categoryRef = doc(db, "categories", slug);
        const existingDoc = await getDoc(categoryRef);

        if (existingDoc.exists()) {
          existing.push(slug);
          console.log(`Category "${slug}" already exists, skipping`);
          continue;
        }

        const categoryData: CategoryData = {
          slug,
          title,
          description: `Trainingsstunden zum Thema ${title}`,
          order: order++,
          createdAt: Date.now(),
        };

        await setDoc(categoryRef, categoryData);
        created.push(slug);
        console.log(`Created category: ${slug} (${title})`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`${slug}: ${message}`);
        console.error(`Failed to create category ${slug}:`, error);
      }
    }

    return { created, existing, errors };
  } catch (error) {
    console.error("Failed to seed categories:", error);
    throw error;
  }
}

function humanizeSlug(slug: string): string {
  const replacements: Record<string, string> = {
    ae: "ä",
    oe: "ö",
    ue: "ü",
    ss: "ß",
  };

  let result = slug;
  for (const [search, replacement] of Object.entries(replacements)) {
    result = result.replace(new RegExp(search, "gi"), replacement);
  }

  return result
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
