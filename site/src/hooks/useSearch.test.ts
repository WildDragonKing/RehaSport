import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useExerciseSearch, PHASE_OPTIONS, DIFFICULTY_OPTIONS } from "./useSearch";

describe("useExerciseSearch", () => {
  it("gibt alle Übungen ohne Filter zurück", () => {
    const { result } = renderHook(() => useExerciseSearch());

    expect(result.current.filteredExercises.length).toBeGreaterThan(0);
    expect(result.current.query).toBe("");
    expect(result.current.selectedPhases).toEqual([]);
    expect(result.current.selectedDifficulty).toBeNull();
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("filtert nach Suchbegriff", () => {
    const { result } = renderHook(() => useExerciseSearch());
    const initialCount = result.current.filteredExercises.length;

    act(() => {
      result.current.setQuery("Schulter");
    });

    expect(result.current.filteredExercises.length).toBeLessThan(initialCount);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("setzt Filter zurück mit clearFilters", () => {
    const { result } = renderHook(() => useExerciseSearch());

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

  it("filtert nach mehreren Phasen", () => {
    const { result } = renderHook(() => useExerciseSearch());

    act(() => {
      result.current.setSelectedPhases(["aufwaermen", "hauptteil"]);
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.selectedPhases).toEqual(["aufwaermen", "hauptteil"]);
  });

  it("filtert nach Schwierigkeit", () => {
    const { result } = renderHook(() => useExerciseSearch());

    act(() => {
      result.current.setSelectedDifficulty("Leicht");
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.selectedDifficulty).toBe("Leicht");
  });
});

describe("Konstanten", () => {
  it("PHASE_OPTIONS hat 4 Phasen", () => {
    expect(PHASE_OPTIONS).toHaveLength(4);
    expect(PHASE_OPTIONS.map((p) => p.id)).toEqual(["aufwaermen", "hauptteil", "schwerpunkt", "ausklang"]);
  });

  it("DIFFICULTY_OPTIONS hat 3 Schwierigkeitsgrade", () => {
    expect(DIFFICULTY_OPTIONS).toHaveLength(3);
    expect(DIFFICULTY_OPTIONS).toContain("Leicht");
    expect(DIFFICULTY_OPTIONS).toContain("Mittel");
    expect(DIFFICULTY_OPTIONS).toContain("Fortgeschritten");
  });
});
