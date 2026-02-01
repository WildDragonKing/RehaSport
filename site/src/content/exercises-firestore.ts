import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Exercise } from "../firebase/types";

export interface ExerciseSection {
  title: string;
  content: string;
}

export interface ExerciseMeta {
  slug: string;
  title: string;
  summary?: string;
  area?: string;
  focus?: string;
  duration?: string;
  difficulty?: string;
  tags: string[];
  related: string[];
  sections: ExerciseSection[];
  kneeAlternative?: { title: string; description: string };
  shoulderAlternative?: { title: string; description: string };
  contraindications?: string[];
}

const exercisesRef = collection(db, "exercises");

// Cache for performance
let cachedExercises: ExerciseMeta[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return Date.now() - cacheTimestamp < CACHE_DURATION;
}

function clearCache(): void {
  cachedExercises = null;
  cacheTimestamp = 0;
}

/**
 * Convert Firestore Exercise to ExerciseMeta
 */
function toExerciseMeta(firestoreExercise: Exercise): ExerciseMeta {
  return {
    slug: firestoreExercise.slug,
    title: firestoreExercise.title,
    summary: firestoreExercise.summary,
    area: firestoreExercise.area,
    focus: firestoreExercise.focus,
    duration: firestoreExercise.duration,
    difficulty: firestoreExercise.difficulty,
    tags: firestoreExercise.tags || [],
    related: firestoreExercise.related || [],
    sections: firestoreExercise.sections || [],
    kneeAlternative: firestoreExercise.kneeAlternative,
    shoulderAlternative: firestoreExercise.shoulderAlternative,
    contraindications: firestoreExercise.contraindications,
  };
}

/**
 * Fetch all exercises from Firestore
 */
export async function getAllExercises(): Promise<ExerciseMeta[]> {
  if (cachedExercises && isCacheValid()) {
    return cachedExercises;
  }

  const q = query(exercisesRef, orderBy("title"));
  const snapshot = await getDocs(q);
  const exercises = snapshot.docs.map((doc) => {
    const data = doc.data() as Exercise;
    return toExerciseMeta({ ...data, id: doc.id });
  });

  cachedExercises = exercises;
  cacheTimestamp = Date.now();

  return exercises;
}

/**
 * Get a specific exercise by slug
 */
export async function getExercise(
  slug: string,
): Promise<ExerciseMeta | undefined> {
  // First try direct document lookup
  const docSnap = await getDoc(doc(exercisesRef, slug));

  if (docSnap.exists()) {
    const data = docSnap.data() as Exercise;
    return toExerciseMeta({ ...data, id: docSnap.id });
  }

  // Fallback: query by slug field
  const q = query(exercisesRef, where("slug", "==", slug));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return undefined;
  }

  const data = snapshot.docs[0].data() as Exercise;
  return toExerciseMeta({ ...data, id: snapshot.docs[0].id });
}

/**
 * Find exercise slug by title (fuzzy matching)
 */
export async function findExerciseSlugByTitle(
  title: string,
): Promise<string | undefined> {
  const exercises = await getAllExercises();
  const normalizedTitle = normalizeKey(title);

  const match = exercises.find(
    (ex) => normalizeKey(ex.title) === normalizedTitle,
  );
  return match?.slug;
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get exercises by area
 */
export async function getExercisesByArea(
  area: string,
): Promise<ExerciseMeta[]> {
  const q = query(exercisesRef, where("area", "==", area), orderBy("title"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Exercise;
    return toExerciseMeta({ ...data, id: doc.id });
  });
}

/**
 * Get exercises by tag
 */
export async function getExercisesByTag(tag: string): Promise<ExerciseMeta[]> {
  const q = query(
    exercisesRef,
    where("tags", "array-contains", tag),
    orderBy("title"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Exercise;
    return toExerciseMeta({ ...data, id: doc.id });
  });
}

/**
 * Search exercises by text (title and summary)
 */
export async function searchExercises(
  searchText: string,
): Promise<ExerciseMeta[]> {
  const exercises = await getAllExercises();
  const normalizedSearch = searchText.toLowerCase();

  return exercises.filter(
    (ex) =>
      ex.title.toLowerCase().includes(normalizedSearch) ||
      ex.summary?.toLowerCase().includes(normalizedSearch) ||
      ex.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch)),
  );
}

// Export for cache invalidation
export { clearCache };
