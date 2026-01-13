import { useCallback, useEffect, useState } from "react";

export interface Rating {
  id: string;
  type: "exercise" | "session";
  rating: number; // 1-5 stars
  timestamp: number;
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>; // 1-5 -> count
}

const STORAGE_KEY = "rehasport-ratings";

function loadRatings(): Rating[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRatings(ratings: Rating[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {
    // localStorage not available
  }
}

export function useRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);

  // Load ratings on mount
  useEffect(() => {
    setRatings(loadRatings());
  }, []);

  // Add or update rating
  const setRating = useCallback((id: string, type: "exercise" | "session", rating: number) => {
    setRatings((prev) => {
      const existing = prev.findIndex((r) => r.id === id && r.type === type);
      const newRating: Rating = { id, type, rating, timestamp: Date.now() };

      let updated: Rating[];
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = newRating;
      } else {
        updated = [...prev, newRating];
      }

      saveRatings(updated);
      return updated;
    });
  }, []);

  // Get rating for specific item
  const getRating = useCallback((id: string, type: "exercise" | "session"): number | null => {
    const found = ratings.find((r) => r.id === id && r.type === type);
    return found ? found.rating : null;
  }, [ratings]);

  // Get summary for specific item
  const getSummary = useCallback((id: string, type: "exercise" | "session"): RatingSummary => {
    const itemRatings = ratings.filter((r) => r.id === id && r.type === type);

    if (itemRatings.length === 0) {
      return { averageRating: 0, totalRatings: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    for (const r of itemRatings) {
      sum += r.rating;
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    }

    return {
      averageRating: sum / itemRatings.length,
      totalRatings: itemRatings.length,
      distribution,
    };
  }, [ratings]);

  // Get all ratings for a type
  const getAllRatings = useCallback((type: "exercise" | "session"): Rating[] => {
    return ratings.filter((r) => r.type === type);
  }, [ratings]);

  // Get top rated items
  const getTopRated = useCallback((type: "exercise" | "session", limit: number = 10): { id: string; rating: number }[] => {
    const typeRatings = ratings.filter((r) => r.type === type);

    // Group by id and calculate average
    const grouped = new Map<string, number[]>();
    for (const r of typeRatings) {
      const existing = grouped.get(r.id) || [];
      existing.push(r.rating);
      grouped.set(r.id, existing);
    }

    // Calculate averages and sort
    const averages: { id: string; rating: number }[] = [];
    for (const [id, ratingList] of grouped) {
      const avg = ratingList.reduce((a, b) => a + b, 0) / ratingList.length;
      averages.push({ id, rating: avg });
    }

    return averages
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }, [ratings]);

  // Remove rating
  const removeRating = useCallback((id: string, type: "exercise" | "session") => {
    setRatings((prev) => {
      const updated = prev.filter((r) => !(r.id === id && r.type === type));
      saveRatings(updated);
      return updated;
    });
  }, []);

  // Clear all ratings
  const clearAllRatings = useCallback(() => {
    setRatings([]);
    saveRatings([]);
  }, []);

  return {
    ratings,
    setRating,
    getRating,
    getSummary,
    getAllRatings,
    getTopRated,
    removeRating,
    clearAllRatings,
  };
}

// Export types for use in other components
export type UseRatingsReturn = ReturnType<typeof useRatings>;
