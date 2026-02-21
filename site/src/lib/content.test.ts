import { beforeEach, describe, expect, it, vi } from "vitest";

const getDocsMock = vi.fn();

vi.mock("./firebase", () => ({
  getDb: vi.fn(() => ({})),
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((...args: unknown[]) => ({ type: "collection", args })),
  query: vi.fn((...args: unknown[]) => ({ type: "query", args })),
  where: vi.fn((...args: unknown[]) => ({ type: "where", args })),
  orderBy: vi.fn((...args: unknown[]) => ({ type: "orderBy", args })),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
}));

import {
  getDataset,
  getExerciseBySlug,
  getSessionBySlugs,
  resetContentCacheForTests,
} from "./content";

function doc(id: string, data: Record<string, unknown>) {
  return {
    id,
    data: () => data,
  };
}

describe("content Firestore integration", () => {
  beforeEach(() => {
    resetContentCacheForTests();
    getDocsMock.mockReset();
  });

  it("maps Firestore docs into dataset and caches the first result", async () => {
    getDocsMock
      .mockResolvedValueOnce({
        docs: [
          doc("ruecken_stunde-a", {
            title: "Stunde A",
            category: "ruecken",
            categoryTitle: "Rücken",
            description: "Kurzbeschreibung",
            duration: "45 Min",
            focus: "Mobilisation",
            phases: [
              {
                title: "Aufwärmen",
                exercises: [
                  {
                    title: "Kreisen",
                    details: [{ label: "Wiederholungen", value: "10" }],
                  },
                ],
              },
            ],
          }),
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          doc("ueb-1", {
            slug: "armkreisen",
            title: "Armkreisen",
            summary: "Schulter mobilisieren",
            tags: ["schulter", "mobil"],
            related: ["wandliegestuetzen"],
            sections: [{ title: "Ausführung", content: "Langsam kreisen." }],
          }),
        ],
      });

    const dataset = await getDataset();
    const cachedDataset = await getDataset();

    expect(getDocsMock).toHaveBeenCalledTimes(2);
    expect(cachedDataset).toBe(dataset);

    expect(dataset.categories).toHaveLength(1);
    expect(dataset.categories[0]).toMatchObject({
      slug: "ruecken",
      title: "Rücken",
      sessionCount: 1,
    });

    expect(dataset.sessions).toHaveLength(1);
    expect(dataset.sessions[0]).toMatchObject({
      slug: "stunde-a",
      title: "Stunde A",
      categorySlug: "ruecken",
      exerciseCount: 1,
    });

    expect(dataset.exercises).toHaveLength(1);
    expect(dataset.exercises[0]).toMatchObject({
      slug: "armkreisen",
      title: "Armkreisen",
    });

    const session = await getSessionBySlugs("ruecken", "stunde-a");
    expect(session?.title).toBe("Stunde A");

    const exercise = await getExerciseBySlug("armkreisen");
    expect(exercise?.title).toBe("Armkreisen");
  });

  it("creates missing categories from session data and refreshes when forced", async () => {
    getDocsMock
      .mockResolvedValueOnce({
        docs: [
          doc("schulter_stunde-b", {
            slug: "stunde-b",
            title: "Stunde B",
            category: "schulter",
            phases: [],
          }),
        ],
      })
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [] });

    const first = await getDataset();
    expect(first.categories).toHaveLength(1);
    expect(first.categories[0]).toMatchObject({
      slug: "schulter",
      title: "Schulter",
      sessionCount: 1,
    });

    await getDataset(true);
    expect(getDocsMock).toHaveBeenCalledTimes(4);
  });
});
