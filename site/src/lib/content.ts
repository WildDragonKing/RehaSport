import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";

import { getDb } from "./firebase";
import type {
  CategorySummary,
  ContentDataset,
  ExerciseDetail,
  SessionDetail,
  SessionExercise,
  SessionPhase,
} from "./types";

const CACHE_TTL = 5 * 60 * 1000;
const FIRESTORE_TIMEOUT_MS = 15_000;

let cachedDataset: ContentDataset | null = null;
let cachedAt = 0;
let activeRequest: Promise<ContentDataset> | null = null;

export function resetContentCacheForTests(): void {
  cachedDataset = null;
  cachedAt = 0;
  activeRequest = null;
}

function toSessionSlug(docId: string, data: DocumentData): string {
  if (typeof data.slug === "string" && data.slug.length > 0) {
    return data.slug;
  }
  if (docId.includes("_")) {
    return docId.split("_").slice(1).join("_");
  }
  return docId;
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function toPhase(input: unknown): SessionPhase {
  if (!input || typeof input !== "object") {
    return { title: "Phase", exercises: [] };
  }

  const raw = input as {
    title?: unknown;
    description?: unknown;
    exercises?: unknown;
  };

  const exercises: SessionExercise[] = Array.isArray(raw.exercises)
    ? raw.exercises
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const typed = item as {
            title?: unknown;
            slug?: unknown;
            details?: unknown;
          };
          return {
            title:
              typeof typed.title === "string"
                ? typed.title
                : "Unbenannte Übung",
            slug: typeof typed.slug === "string" ? typed.slug : undefined,
            details: Array.isArray(typed.details)
              ? typed.details
                  .filter((detail) => detail && typeof detail === "object")
                  .map((detail) => {
                    const typedDetail = detail as {
                      label?: unknown;
                      value?: unknown;
                    };
                    return {
                      label:
                        typeof typedDetail.label === "string"
                          ? typedDetail.label
                          : "Hinweis",
                      value:
                        typeof typedDetail.value === "string"
                          ? typedDetail.value
                          : "",
                    };
                  })
              : [],
          };
        })
    : [];

  return {
    title: typeof raw.title === "string" ? raw.title : "Phase",
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    exercises,
  };
}

async function fetchDataset(): Promise<ContentDataset> {
  const db = getDb();
  const withTimeout = async <T>(
    request: Promise<T>,
    label: string,
  ): Promise<T> => {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `${label} konnte nicht rechtzeitig geladen werden. Bitte Verbindung prüfen.`,
          ),
        );
      }, FIRESTORE_TIMEOUT_MS);
    });

    return Promise.race([request, timeout]);
  };

  const [sessionsSnap, exercisesSnap] = await Promise.all([
    withTimeout(
      getDocs(
        query(
          collection(db, "sessions"),
          where("status", "==", "published"),
          orderBy("title"),
        ),
      ),
      "Stunden",
    ),
    withTimeout(
      getDocs(query(collection(db, "exercises"), orderBy("title"))),
      "Übungen",
    ),
  ]);

  const categoryMap = new Map<string, CategorySummary>();

  const sessions: SessionDetail[] = sessionsSnap.docs.map((sessionDoc) => {
    const data = sessionDoc.data();
    const categorySlug =
      typeof data.categorySlug === "string"
        ? data.categorySlug
        : typeof data.category === "string"
          ? data.category
          : "ohne-kategorie";

    const phases = Array.isArray(data.phases)
      ? data.phases.map((phase) => toPhase(phase))
      : [];

    const exercises = phases.flatMap((phase) => phase.exercises);

    const existingCategory = categoryMap.get(categorySlug);
    if (existingCategory) {
      existingCategory.sessionCount += 1;
    } else {
      categoryMap.set(categorySlug, {
        slug: categorySlug,
        title:
          typeof data.categoryTitle === "string"
            ? data.categoryTitle
            : humanizeSlug(categorySlug),
        description: undefined,
        focusTags: [],
        sessionCount: 1,
      });
    }

    return {
      slug: toSessionSlug(sessionDoc.id, data),
      title: typeof data.title === "string" ? data.title : "Unbenannte Stunde",
      description:
        typeof data.description === "string" ? data.description : undefined,
      duration: typeof data.duration === "string" ? data.duration : undefined,
      focus: typeof data.focus === "string" ? data.focus : undefined,
      categorySlug,
      categoryTitle:
        typeof data.categoryTitle === "string"
          ? data.categoryTitle
          : (categoryMap.get(categorySlug)?.title ??
            humanizeSlug(categorySlug)),
      exerciseCount: exercises.length,
      phases,
      exercises,
    };
  });

  const exercises: ExerciseDetail[] = exercisesSnap.docs.map((exerciseDoc) => {
    const data = exerciseDoc.data();

    return {
      slug:
        typeof data.slug === "string" && data.slug.length > 0
          ? data.slug
          : exerciseDoc.id,
      title: typeof data.title === "string" ? data.title : "Unbenannte Übung",
      summary: typeof data.summary === "string" ? data.summary : undefined,
      area: typeof data.area === "string" ? data.area : undefined,
      focus: typeof data.focus === "string" ? data.focus : undefined,
      duration: typeof data.duration === "string" ? data.duration : undefined,
      difficulty:
        typeof data.difficulty === "string" ? data.difficulty : undefined,
      tags: Array.isArray(data.tags)
        ? data.tags.filter((tag): tag is string => typeof tag === "string")
        : [],
      related: Array.isArray(data.related)
        ? data.related.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      sections: Array.isArray(data.sections)
        ? data.sections
            .filter((section) => section && typeof section === "object")
            .map((section) => {
              const typed = section as { title?: unknown; content?: unknown };
              return {
                title:
                  typeof typed.title === "string" ? typed.title : "Abschnitt",
                content: typeof typed.content === "string" ? typed.content : "",
              };
            })
        : [],
      kneeAlternative:
        data.kneeAlternative && typeof data.kneeAlternative === "object"
          ? {
              title:
                typeof data.kneeAlternative.title === "string"
                  ? data.kneeAlternative.title
                  : "Alternative",
              description:
                typeof data.kneeAlternative.description === "string"
                  ? data.kneeAlternative.description
                  : "",
            }
          : undefined,
      shoulderAlternative:
        data.shoulderAlternative && typeof data.shoulderAlternative === "object"
          ? {
              title:
                typeof data.shoulderAlternative.title === "string"
                  ? data.shoulderAlternative.title
                  : "Alternative",
              description:
                typeof data.shoulderAlternative.description === "string"
                  ? data.shoulderAlternative.description
                  : "",
            }
          : undefined,
      contraindications: Array.isArray(data.contraindications)
        ? data.contraindications.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      media:
        data.media && typeof data.media === "object"
          ? {
              videoUrl:
                typeof data.media.videoUrl === "string"
                  ? data.media.videoUrl
                  : undefined,
              audioUrl:
                typeof data.media.audioUrl === "string"
                  ? data.media.audioUrl
                  : undefined,
              thumbnailUrl:
                typeof data.media.thumbnailUrl === "string"
                  ? data.media.thumbnailUrl
                  : undefined,
            }
          : undefined,
    };
  });

  const categories = Array.from(categoryMap.values()).sort((a, b) =>
    a.title.localeCompare(b.title, "de"),
  );

  return {
    categories,
    sessions: sessions.sort((a, b) => a.title.localeCompare(b.title, "de")),
    exercises: exercises.sort((a, b) => a.title.localeCompare(b.title, "de")),
  };
}

export async function getDataset(
  forceRefresh = false,
): Promise<ContentDataset> {
  const isValid = Date.now() - cachedAt < CACHE_TTL;

  if (!forceRefresh && cachedDataset && isValid) {
    return cachedDataset;
  }

  if (!forceRefresh && activeRequest) {
    return activeRequest;
  }

  activeRequest = fetchDataset()
    .then((result) => {
      cachedDataset = result;
      cachedAt = Date.now();
      return result;
    })
    .finally(() => {
      activeRequest = null;
    });

  return activeRequest;
}

export async function getSessions() {
  const { sessions } = await getDataset();
  return sessions;
}

export async function getSessionBySlugs(
  categorySlug: string,
  sessionSlug: string,
) {
  const { sessions } = await getDataset();
  return sessions.find(
    (session) =>
      session.categorySlug === categorySlug && session.slug === sessionSlug,
  );
}

export async function getExercises() {
  const { exercises } = await getDataset();
  return exercises;
}

export async function getExerciseBySlug(slug: string) {
  const { exercises } = await getDataset();
  return exercises.find((exercise) => exercise.slug === slug);
}
