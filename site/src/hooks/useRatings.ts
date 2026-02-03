import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";

export interface RatingDoc {
  targetId: string;
  targetType: "exercise" | "session";
  totalRatings: number;
  sumRatings: number;
  averageRating: number;
  updatedAt: number;
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
}

const LOCAL_RATINGS_KEY = "rehasport-my-ratings";

// Store visitor's own ratings in localStorage
function getMyRatings(): Map<string, number> {
  try {
    const stored = localStorage.getItem(LOCAL_RATINGS_KEY);
    return stored ? new Map(JSON.parse(stored)) : new Map();
  } catch {
    return new Map();
  }
}

function saveMyRating(key: string, rating: number) {
  try {
    const ratings = getMyRatings();
    ratings.set(key, rating);
    localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify([...ratings]));
  } catch {
    // localStorage not available
  }
}

// Sanitize ID for Firestore document path
function sanitizeId(id: string): string {
  return id.replace(/\//g, "__");
}

export function useRatings() {
  const [myRatings, setMyRatings] = useState<Map<string, number>>(new Map());
  const [summaryCache, setSummaryCache] = useState<Map<string, RatingSummary>>(
    new Map(),
  );

  // Load my ratings from localStorage on mount
  useEffect(() => {
    setMyRatings(getMyRatings());
  }, []);

  // Add or update rating (aggregated)
  const setRating = useCallback(
    async (
      targetId: string,
      targetType: "exercise" | "session",
      rating: number,
    ) => {
      const key = `${targetType}:${targetId}`;
      const docId = `${targetType}_${sanitizeId(targetId)}`;
      const ratingDocRef = doc(db, "ratings", docId);

      // Check if user already rated this
      const previousRating = myRatings.get(key);

      try {
        const docSnap = await getDoc(ratingDocRef);

        if (docSnap.exists()) {
          // Update existing aggregate
          if (previousRating !== undefined) {
            // User is changing their rating - adjust the sum
            const diff = rating - previousRating;
            await updateDoc(ratingDocRef, {
              sumRatings: increment(diff),
              updatedAt: Date.now(),
            });
          } else {
            // New rating from this user
            await updateDoc(ratingDocRef, {
              totalRatings: increment(1),
              sumRatings: increment(rating),
              updatedAt: Date.now(),
            });
          }
        } else {
          // Create new aggregate document
          const newDoc: RatingDoc = {
            targetId,
            targetType,
            totalRatings: 1,
            sumRatings: rating,
            averageRating: rating,
            updatedAt: Date.now(),
          };
          await setDoc(ratingDocRef, newDoc);
        }

        // Save my rating locally
        saveMyRating(key, rating);
        setMyRatings((prev) => new Map(prev).set(key, rating));

        // Invalidate cache
        setSummaryCache((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
      } catch (error) {
        console.error("Failed to save rating:", error);
        throw error;
      }
    },
    [myRatings],
  );

  // Get my rating for specific item
  const getRating = useCallback(
    (targetId: string, targetType: "exercise" | "session"): number | null => {
      const key = `${targetType}:${targetId}`;
      return myRatings.get(key) ?? null;
    },
    [myRatings],
  );

  // Get summary for specific item
  const getSummary = useCallback(
    async (
      targetId: string,
      targetType: "exercise" | "session",
    ): Promise<RatingSummary> => {
      const key = `${targetType}:${targetId}`;

      // Check cache
      const cached = summaryCache.get(key);
      if (cached) return cached;

      try {
        const docId = `${targetType}_${sanitizeId(targetId)}`;
        const docSnap = await getDoc(doc(db, "ratings", docId));

        if (!docSnap.exists()) {
          const empty: RatingSummary = { averageRating: 0, totalRatings: 0 };
          setSummaryCache((prev) => new Map(prev).set(key, empty));
          return empty;
        }

        const data = docSnap.data() as RatingDoc;
        const summary: RatingSummary = {
          averageRating:
            data.totalRatings > 0 ? data.sumRatings / data.totalRatings : 0,
          totalRatings: data.totalRatings,
        };

        setSummaryCache((prev) => new Map(prev).set(key, summary));
        return summary;
      } catch (error) {
        console.error("Failed to get rating summary:", error);
        return { averageRating: 0, totalRatings: 0 };
      }
    },
    [summaryCache],
  );

  return {
    setRating,
    getRating,
    getSummary,
  };
}

export type UseRatingsReturn = ReturnType<typeof useRatings>;
