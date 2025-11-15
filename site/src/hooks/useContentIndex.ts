import { useEffect, useState } from "react";
import type { ContentEntry } from "../types";

export interface UseContentIndexResult {
  entries: ContentEntry[];
  isLoading: boolean;
  error?: Error;
}

export function useContentIndex(): UseContentIndexResult {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}content-index.json`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Konnte content-index.json nicht laden: ${response.status}`);
        }
        return response.json();
      })
      .then((data: ContentEntry[]) => {
        if (!isMounted) return;
        setEntries(
          data.map((entry) => ({
            ...entry,
            concepts: entry.concepts?.map((item) => item.trim()).filter(Boolean) ?? [],
            phases: entry.phases?.map((item) => item.trim()).filter(Boolean) ?? [],
            tags: entry.tags?.map((item) => item.trim()).filter(Boolean) ?? []
          }))
        );
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { entries, isLoading, error };
}
