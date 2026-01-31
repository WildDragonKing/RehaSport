import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Session } from '../firebase/types';

export interface SessionMeta {
  slug: string;
  title: string;
  description?: string;
  duration?: string;
  focus?: string;
  phases: SessionPhase[];
  exercises: SessionExercise[];
  categorySlug: string;
  categoryTitle: string;
}

export interface SessionPhase {
  title: string;
  description?: string;
  exercises: SessionExercise[];
}

export interface SessionExercise {
  title: string;
  details: SessionExerciseDetail[];
}

export interface SessionExerciseDetail {
  label: string;
  value: string;
}

export interface CategoryMeta {
  slug: string;
  title: string;
  description?: string;
  focusTags: string[];
  sessions: SessionMeta[];
}

const sessionsRef = collection(db, 'sessions');

// Cache for performance
let cachedCategories: CategoryMeta[] | null = null;
let cachedSessions: SessionMeta[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return Date.now() - cacheTimestamp < CACHE_DURATION;
}

function clearCache(): void {
  cachedCategories = null;
  cachedSessions = null;
  cacheTimestamp = 0;
}

/**
 * Convert Firestore Session to SessionMeta
 */
function toSessionMeta(firestoreSession: Session): SessionMeta {
  const allExercises = firestoreSession.phases?.flatMap(phase => phase.exercises) || [];

  return {
    slug: firestoreSession.id || '',
    title: firestoreSession.title,
    description: firestoreSession.description,
    duration: firestoreSession.duration,
    focus: firestoreSession.focus,
    phases: firestoreSession.phases || [],
    exercises: allExercises,
    categorySlug: firestoreSession.category,
    categoryTitle: firestoreSession.categoryTitle || humanizeSlug(firestoreSession.category),
  };
}

function humanizeSlug(slug: string): string {
  const replacements: Record<string, string> = {
    ae: 'ä',
    oe: 'ö',
    ue: 'ü',
    ss: 'ß',
  };

  const words = slug.split('-').map((word) => {
    let result = word;
    for (const [search, replacement] of Object.entries(replacements)) {
      result = result.replace(new RegExp(search, 'gi'), replacement);
    }
    return result.charAt(0).toUpperCase() + result.slice(1);
  });

  return words.join(' ');
}

/**
 * Fetch all published sessions from Firestore
 */
export async function getAllSessions(): Promise<SessionMeta[]> {
  if (cachedSessions && isCacheValid()) {
    return cachedSessions;
  }

  const q = query(
    sessionsRef,
    where('status', '==', 'published'),
    orderBy('title')
  );

  const snapshot = await getDocs(q);
  const sessions = snapshot.docs.map(doc => {
    const data = doc.data() as Session;
    // Extract slug from document ID (format: categorySlug_sessionSlug)
    const parts = doc.id.split('_');
    const sessionSlug = parts.slice(1).join('_');
    return toSessionMeta({ ...data, id: sessionSlug });
  });

  cachedSessions = sessions;
  cacheTimestamp = Date.now();

  return sessions;
}

/**
 * Fetch categories from Firestore categories collection and merge with sessions
 */
export async function getCategories(): Promise<CategoryMeta[]> {
  if (cachedCategories && isCacheValid()) {
    return cachedCategories;
  }

  // Load categories from categories collection
  const categoriesRef = collection(db, 'categories');
  const categoriesSnapshot = await getDocs(categoriesRef);
  const categoryMap = new Map<string, CategoryMeta>();

  // First, add all categories from the categories collection
  for (const catDoc of categoriesSnapshot.docs) {
    const data = catDoc.data();
    categoryMap.set(data.slug, {
      slug: data.slug,
      title: data.title,
      description: data.description || '',
      focusTags: data.focusTags || [],
      sessions: [],
    });
  }

  // Then load sessions and add them to their categories
  const sessions = await getAllSessions();

  for (const session of sessions) {
    const existing = categoryMap.get(session.categorySlug);
    if (existing) {
      existing.sessions.push(session);
      // Add focus tags from sessions
      if (session.focus) {
        const parts = session.focus.split(',').map(t => t.trim()).filter(Boolean);
        for (const part of parts) {
          if (!existing.focusTags.includes(part)) {
            existing.focusTags.push(part);
          }
        }
      }
    } else {
      // Session has a category that's not in the categories collection
      // Create it dynamically (backwards compatibility)
      categoryMap.set(session.categorySlug, {
        slug: session.categorySlug,
        title: session.categoryTitle,
        description: session.description || '',
        focusTags: session.focus ? session.focus.split(',').map(t => t.trim()).filter(Boolean) : [],
        sessions: [session],
      });
    }
  }

  // Sort sessions within each category and sort focus tags
  for (const category of categoryMap.values()) {
    category.sessions.sort((a, b) => a.title.localeCompare(b.title, 'de'));
    category.focusTags.sort((a, b) => a.localeCompare(b, 'de'));
  }

  const categories = Array.from(categoryMap.values()).sort((a, b) =>
    a.title.localeCompare(b.title, 'de')
  );

  cachedCategories = categories;

  return categories;
}

/**
 * Get a specific category
 */
export async function getCategory(slug: string): Promise<CategoryMeta | undefined> {
  const categories = await getCategories();
  return categories.find(c => c.slug === slug);
}

/**
 * Get a specific session
 */
export async function getSession(categorySlug: string, sessionSlug: string): Promise<SessionMeta | undefined> {
  const docId = `${categorySlug}_${sessionSlug}`;
  const docSnap = await getDoc(doc(sessionsRef, docId));

  if (!docSnap.exists()) {
    return undefined;
  }

  const data = docSnap.data() as Session;
  return toSessionMeta({ ...data, id: sessionSlug });
}

// Export for cache invalidation
export { clearCache };
