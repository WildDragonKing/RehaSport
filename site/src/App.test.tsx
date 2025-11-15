import { renderToString } from "react-dom/server";
import { describe, expect, it, vi, type Mock } from "vitest";

import App from "./App";

type ContentIndexResult = {
  entries: {
    id: string;
    type: "stunde";
    path: string;
    title: string;
    summary: string;
    concepts: string[];
    phases: string[];
    tags: string[];
  }[];
  isLoading: boolean;
  error: undefined;
};

type MockUseContentIndex = Mock<[], ContentIndexResult>;
import type { UseContentIndexResult } from "./hooks/useContentIndex";

const mockEntries = [
  {
    id: "stunde-1",
    type: "stunde" as const,
    path: "Stunden/balance-basics.md",
    title: "Balance Basics",
    summary: "Stabilität verbessern",
    concepts: ["Balance"],
    phases: ["Phase 1"],
    tags: ["mobilität"]
  }
];

vi.mock("./hooks/useContentIndex", () => {
  const useContentIndex: MockUseContentIndex = vi.fn<[], ContentIndexResult>(() => ({
  const useContentIndex = vi.fn<[], UseContentIndexResult>(() => ({
    entries: mockEntries,
    isLoading: false,
    error: undefined
  }));

  return { useContentIndex };
});

describe("App", () => {
  it("rendert die Navigation und die Inhalte der aktiven Kategorie", () => {
    const html = renderToString(<App />);

    expect(html).toContain("Stunden");
    expect(html).toContain("Übungen");
    expect(html).toContain("Konzepte");
    expect(html).toContain("Balance Basics");
  });
});
