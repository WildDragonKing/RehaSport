import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { CategoryMeta, SessionMeta } from '../content/sessions';
import type { ExerciseMeta } from '../content/exercises';

// Import both local and Firestore loaders
import {
  categories as localCategories,
  getAllSessions as getLocalSessions,
  getCategory as getLocalCategory,
  getSession as getLocalSession,
} from '../content/sessions';
import {
  exercises as localExercises,
  getExercise as getLocalExercise,
} from '../content/exercises';
import {
  getCategories as getFirestoreCategories,
  getAllSessions as getFirestoreSessions,
  getCategory as getFirestoreCategory,
  getSession as getFirestoreSession,
} from '../content/sessions-firestore';
import {
  getAllExercises as getFirestoreExercises,
  getExercise as getFirestoreExercise,
} from '../content/exercises-firestore';
import { hasFirestoreData } from '../firebase/migration';

type DataSource = 'local' | 'firestore' | 'auto';

interface ContentContextType {
  // Data source
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
  isFirestoreAvailable: boolean;

  // Loading state
  loading: boolean;
  error: string | null;

  // Sessions
  categories: CategoryMeta[];
  sessions: SessionMeta[];
  getCategory: (slug: string) => CategoryMeta | undefined;
  getSession: (categorySlug: string, sessionSlug: string) => SessionMeta | undefined;

  // Exercises
  exercises: ExerciseMeta[];
  getExercise: (slug: string) => ExerciseMeta | undefined;

  // Refresh
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
  preferFirestore?: boolean;
}

export function ContentProvider({ children, preferFirestore = false }: ContentProviderProps) {
  const [dataSource, setDataSource] = useState<DataSource>('local');
  const [isFirestoreAvailable, setIsFirestoreAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local data (available immediately at build time)
  const [categories, setCategories] = useState<CategoryMeta[]>(localCategories);
  const [sessions, setSessions] = useState<SessionMeta[]>(getLocalSessions());
  const [exercises, setExercises] = useState<ExerciseMeta[]>(localExercises);

  // Check Firestore availability and load data
  const loadData = useCallback(async () => {
    // Skip if we're already loading or explicitly using local data
    if (dataSource === 'local') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if Firestore has data
      const firestoreData = await hasFirestoreData();
      const hasData = firestoreData.sessions > 0 && firestoreData.exercises > 0;
      setIsFirestoreAvailable(hasData);

      // Determine actual data source
      let actualSource: 'local' | 'firestore' = 'local';
      if (dataSource === 'firestore' || (dataSource === 'auto' && hasData && preferFirestore)) {
        actualSource = 'firestore';
      }

      if (actualSource === 'firestore') {
        // Load from Firestore
        const [firestoreCategories, firestoreSessions, firestoreExercises] = await Promise.all([
          getFirestoreCategories(),
          getFirestoreSessions(),
          getFirestoreExercises(),
        ]);

        setCategories(firestoreCategories as CategoryMeta[]);
        setSessions(firestoreSessions as SessionMeta[]);
        setExercises(firestoreExercises as unknown as ExerciseMeta[]);
      } else {
        // Use local data (already set as default)
        setCategories(localCategories);
        setSessions(getLocalSessions());
        setExercises(localExercises);
      }
    } catch (err) {
      console.error('Failed to load content:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Inhalte');
      // Fallback to local data
      setCategories(localCategories);
      setSessions(getLocalSessions());
      setExercises(localExercises);
    } finally {
      setLoading(false);
    }
  }, [dataSource, preferFirestore]);

  useEffect(() => {
    if (dataSource !== 'local') {
      loadData();
    }
  }, [loadData, dataSource]);

  // Getter functions that work with current state
  const getCategory = useCallback(
    (slug: string) => categories.find(c => c.slug === slug),
    [categories]
  );

  const getSession = useCallback(
    (categorySlug: string, sessionSlug: string) =>
      sessions.find(s => s.categorySlug === categorySlug && s.slug === sessionSlug),
    [sessions]
  );

  const getExercise = useCallback(
    (slug: string) => exercises.find(e => e.slug === slug),
    [exercises]
  );

  const value: ContentContextType = {
    dataSource,
    setDataSource,
    isFirestoreAvailable,
    loading,
    error,
    categories,
    sessions,
    getCategory,
    getSession,
    exercises,
    getExercise,
    refresh: loadData,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextType {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

// Convenience hooks
export function useCategories(): { categories: CategoryMeta[]; loading: boolean } {
  const { categories, loading } = useContent();
  return { categories, loading };
}

export function useCategory(slug: string): { category: CategoryMeta | undefined; loading: boolean } {
  const { getCategory, loading } = useContent();
  return { category: getCategory(slug), loading };
}

export function useSessions(): { sessions: SessionMeta[]; loading: boolean } {
  const { sessions, loading } = useContent();
  return { sessions, loading };
}

export function useSession(
  categorySlug: string,
  sessionSlug: string
): { session: SessionMeta | undefined; loading: boolean } {
  const { getSession, loading } = useContent();
  return { session: getSession(categorySlug, sessionSlug), loading };
}

export function useExercises(): { exercises: ExerciseMeta[]; loading: boolean } {
  const { exercises, loading } = useContent();
  return { exercises, loading };
}

export function useExercise(slug: string): { exercise: ExerciseMeta | undefined; loading: boolean } {
  const { getExercise, loading } = useContent();
  return { exercise: getExercise(slug), loading };
}
