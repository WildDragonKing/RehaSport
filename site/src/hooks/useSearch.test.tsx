import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ReactNode } from "react";
import {
  useExerciseSearch,
  PHASE_OPTIONS,
  DIFFICULTY_OPTIONS,
} from "./useSearch";
import { ContentProvider } from "../contexts/ContentContext";

// Mock data must be defined inside the mock factory for hoisting to work
vi.mock("../content/sessions-firestore", () => ({
  getCategories: vi.fn().mockResolvedValue([]),
  getAllSessions: vi.fn().mockResolvedValue([]),
}));

vi.mock("../content/exercises-firestore", () => ({
  getAllExercises: vi.fn().mockResolvedValue([
    {
      slug: "schulterkreisen",
      title: "Schulterkreisen",
      summary: "Kreisende Schulterbewegungen",
      area: "Schulter",
      focus: "Mobilisation",
      difficulty: "Leicht",
      tags: ["aufwaermen", "schulter"],
      related: [],
      sections: [],
    },
    {
      slug: "kniebeugen",
      title: "Kniebeugen",
      summary: "Klassische Kniebeuge",
      area: "Beine",
      focus: "Kraft",
      difficulty: "Mittel",
      tags: ["hauptteil", "beine"],
      related: [],
      sections: [],
    },
    {
      slug: "dehnuebung-ruecken",
      title: "Dehnübung Rücken",
      summary: "Sanfte Rückendehnung",
      area: "Rücken",
      focus: "Dehnung",
      difficulty: "Leicht",
      tags: ["ausklang", "ruecken"],
      related: [],
      sections: [],
    },
  ]),
}));

// Wrapper component for ContentProvider
function wrapper({ children }: { children: ReactNode }) {
  return <ContentProvider>{children}</ContentProvider>;
}

describe("useExerciseSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gibt alle Übungen ohne Filter zurück", async () => {
    const { result } = renderHook(() => useExerciseSearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.filteredExercises.length).toBe(3);
    expect(result.current.query).toBe("");
    expect(result.current.selectedPhases).toEqual([]);
    expect(result.current.selectedDifficulty).toBeNull();
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("filtert nach Suchbegriff", async () => {
    const { result } = renderHook(() => useExerciseSearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCount = result.current.filteredExercises.length;

    act(() => {
      result.current.setQuery("Schulter");
    });

    expect(result.current.filteredExercises.length).toBeLessThan(initialCount);
    expect(result.current.filteredExercises[0].title).toBe("Schulterkreisen");
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("setzt Filter zurück mit clearFilters", async () => {
    const { result } = renderHook(() => useExerciseSearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setQuery("Test");
      result.current.setSelectedPhases(["aufwaermen"]);
      result.current.setSelectedDifficulty("Leicht");
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.query).toBe("");
    expect(result.current.selectedPhases).toEqual([]);
    expect(result.current.selectedDifficulty).toBeNull();
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("filtert nach mehreren Phasen", async () => {
    const { result } = renderHook(() => useExerciseSearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSelectedPhases(["aufwaermen", "hauptteil"]);
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.selectedPhases).toEqual(["aufwaermen", "hauptteil"]);
    // Should return exercises tagged with aufwaermen or hauptteil
    expect(result.current.filteredExercises.length).toBe(2);
  });

  it("filtert nach Schwierigkeit", async () => {
    const { result } = renderHook(() => useExerciseSearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSelectedDifficulty("Leicht");
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.selectedDifficulty).toBe("Leicht");
    // Should return only "Leicht" exercises
    expect(result.current.filteredExercises.length).toBe(2);
  });
});

describe("Konstanten", () => {
  it("PHASE_OPTIONS hat 4 Phasen", () => {
    expect(PHASE_OPTIONS).toHaveLength(4);
    expect(PHASE_OPTIONS.map((p) => p.id)).toEqual([
      "aufwaermen",
      "hauptteil",
      "schwerpunkt",
      "ausklang",
    ]);
  });

  it("DIFFICULTY_OPTIONS hat 3 Schwierigkeitsgrade", () => {
    expect(DIFFICULTY_OPTIONS).toHaveLength(3);
    expect(DIFFICULTY_OPTIONS).toContain("Leicht");
    expect(DIFFICULTY_OPTIONS).toContain("Mittel");
    expect(DIFFICULTY_OPTIONS).toContain("Fortgeschritten");
  });
});
