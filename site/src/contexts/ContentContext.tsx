import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import type { CategoryMeta, SessionMeta } from "../content/sessions";
import type { ExerciseMeta } from "../content/exercises";

// Firestore loaders
import {
  getCategories as getFirestoreCategories,
  getAllSessions as getFirestoreSessions,
} from "../content/sessions-firestore";
import { getAllExercises as getFirestoreExercises } from "../content/exercises-firestore";

type DataSource = "firestore";

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
  getSession: (
    categorySlug: string,
    sessionSlug: string,
  ) => SessionMeta | undefined;

  // Exercises
  exercises: ExerciseMeta[];
  getExercise: (slug: string) => ExerciseMeta | undefined;
  findExerciseByTitle: (title: string) => ExerciseMeta | undefined;

  // Refresh
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
}

export function ContentProvider({ children }: ContentProviderProps) {
  const [dataSource, setDataSource] = useState<DataSource>("firestore");
  const [isFirestoreAvailable, setIsFirestoreAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Start with empty data, load from Firestore
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [exercises, setExercises] = useState<ExerciseMeta[]>([]);

  // Load data from Firestore
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load from Firestore
      const [firestoreCategories, firestoreSessions, firestoreExercises] =
        await Promise.all([
          getFirestoreCategories(),
          getFirestoreSessions(),
          getFirestoreExercises(),
        ]);

      setCategories(firestoreCategories as CategoryMeta[]);
      setSessions(firestoreSessions as SessionMeta[]);
      setExercises(firestoreExercises as unknown as ExerciseMeta[]);
      setIsFirestoreAvailable(true);
    } catch (err) {
      console.error("Failed to load content from Firestore:", err);
      setError(
        err instanceof Error ? err.message : "Fehler beim Laden der Inhalte",
      );
      setIsFirestoreAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Getter functions that work with current state
  const getCategory = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug),
    [categories],
  );

  const getSession = useCallback(
    (categorySlug: string, sessionSlug: string) =>
      sessions.find(
        (s) => s.categorySlug === categorySlug && s.slug === sessionSlug,
      ),
    [sessions],
  );

  const getExercise = useCallback(
    (slug: string) => exercises.find((e) => e.slug === slug),
    [exercises],
  );

  const findExerciseByTitle = useCallback(
    (title: string) =>
      exercises.find(
        (e) =>
          e.title.toLowerCase() === title.toLowerCase() ||
          e.title.toLowerCase().includes(title.toLowerCase()),
      ),
    [exercises],
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
    findExerciseByTitle,
    refresh: loadData,
  };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useContent(): ContentContextType {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}

// Convenience hooks
export function useCategories(): {
  categories: CategoryMeta[];
  loading: boolean;
} {
  const { categories, loading } = useContent();
  return { categories, loading };
}

export function useCategory(slug: string): {
  category: CategoryMeta | undefined;
  loading: boolean;
} {
  const { getCategory, loading } = useContent();
  return { category: getCategory(slug), loading };
}

export function useSessions(): { sessions: SessionMeta[]; loading: boolean } {
  const { sessions, loading } = useContent();
  return { sessions, loading };
}

export function useSession(
  categorySlug: string,
  sessionSlug: string,
): { session: SessionMeta | undefined; loading: boolean } {
  const { getSession, loading } = useContent();
  return { session: getSession(categorySlug, sessionSlug), loading };
}

export function useExercises(): {
  exercises: ExerciseMeta[];
  loading: boolean;
} {
  const { exercises, loading } = useContent();
  return { exercises, loading };
}

export function useExercise(slug: string): {
  exercise: ExerciseMeta | undefined;
  loading: boolean;
} {
  const { getExercise, loading } = useContent();
  return { exercise: getExercise(slug), loading };
}
