import { useMemo, useState } from "react";
import { useContent } from "../contexts/ContentContext";
import type { ExerciseMeta } from "../content/exercises";

export interface SearchFilters {
  query: string;
  phases: string[];
  difficulty: string | null;
}

export interface UseSearchResult {
  filteredExercises: ExerciseMeta[];
  query: string;
  setQuery: (value: string) => void;
  selectedPhases: string[];
  setSelectedPhases: (phases: string[]) => void;
  selectedDifficulty: string | null;
  setSelectedDifficulty: (difficulty: string | null) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  loading: boolean;
}

export function useExerciseSearch(): UseSearchResult {
  const { exercises, loading } = useContent();
  const [query, setQuery] = useState("");
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null,
  );

  const filteredExercises = useMemo(() => {
    let results = [...exercises];

    // Textsuche in Name, Summary, Tags
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (ex) =>
          ex.title.toLowerCase().includes(q) ||
          ex.summary?.toLowerCase().includes(q) ||
          ex.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          ex.area?.toLowerCase().includes(q) ||
          ex.focus?.toLowerCase().includes(q),
      );
    }

    // Phase-Filter (aus Tags ableiten)
    if (selectedPhases.length > 0) {
      results = results.filter((ex) =>
        selectedPhases.some((phase) => ex.tags.includes(phase)),
      );
    }

    // Schwierigkeits-Filter
    if (selectedDifficulty) {
      results = results.filter(
        (ex) =>
          ex.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase(),
      );
    }

    return results;
  }, [exercises, query, selectedPhases, selectedDifficulty]);

  const clearFilters = () => {
    setQuery("");
    setSelectedPhases([]);
    setSelectedDifficulty(null);
  };

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedPhases.length > 0 ||
    selectedDifficulty !== null;

  return {
    filteredExercises,
    query,
    setQuery,
    selectedPhases,
    setSelectedPhases,
    selectedDifficulty,
    setSelectedDifficulty,
    clearFilters,
    hasActiveFilters,
    loading,
  };
}

export const PHASE_OPTIONS = [
  { id: "aufwaermen", label: "Aufwärmen" },
  { id: "hauptteil", label: "Hauptteil" },
  { id: "schwerpunkt", label: "Schwerpunkt" },
  { id: "ausklang", label: "Ausklang" },
];

export const DIFFICULTY_OPTIONS = ["Leicht", "Mittel", "Fortgeschritten"];
