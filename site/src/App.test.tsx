import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import App from "./App";
import { ThemeProvider } from "./components/theme/ThemeProvider";

// Mock the Firestore loaders
vi.mock("./content/sessions-firestore", () => ({
  getCategories: vi.fn().mockResolvedValue([
    {
      slug: "ruecken",
      title: "Rücken",
      description: "Übungen für den Rücken",
      focusTags: ["Rücken", "Rumpfstabilität"],
      sessions: [
        {
          slug: "stabilitaet-und-mobilisation",
          title: "Stabilität & Mobilisation",
          description: "Stabilisierende Übungen",
          duration: "45 Min",
          focus: "Rücken, Rumpfstabilität",
          categorySlug: "ruecken",
          categoryTitle: "Rücken",
          phases: [
            {
              title: "Aufwärmen",
              description: "Sanfter Einstieg",
              exercises: [
                {
                  title: "Schulterkreisen",
                  details: [{ label: "Dauer", value: "2 Minuten" }],
                },
              ],
            },
          ],
          exercises: [
            {
              title: "Schulterkreisen",
              details: [{ label: "Dauer", value: "2 Minuten" }],
            },
          ],
        },
      ],
    },
  ]),
  getAllSessions: vi.fn().mockResolvedValue([
    {
      slug: "stabilitaet-und-mobilisation",
      title: "Stabilität & Mobilisation",
      description: "Stabilisierende Übungen",
      duration: "45 Min",
      focus: "Rücken, Rumpfstabilität",
      categorySlug: "ruecken",
      categoryTitle: "Rücken",
      phases: [
        {
          title: "Aufwärmen",
          description: "Sanfter Einstieg",
          exercises: [
            {
              title: "Schulterkreisen",
              details: [{ label: "Dauer", value: "2 Minuten" }],
            },
          ],
        },
      ],
      exercises: [
        {
          title: "Schulterkreisen",
          details: [{ label: "Dauer", value: "2 Minuten" }],
        },
      ],
    },
  ]),
}));

vi.mock("./content/exercises-firestore", () => ({
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
      sections: [{ title: "Ausführung", content: "Schultern kreisen lassen." }],
    },
  ]),
}));

function renderWithProviders(ui: React.ReactElement, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>{ui}</ThemeProvider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("zeigt die Homepage mit Hero-Text", async () => {
    renderWithProviders(<App />);

    // Wait for content to load - hero title should appear
    await waitFor(
      () => {
        expect(screen.getByText("Bewegung, die gut tut")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Check that structued training text appears
    expect(
      screen.getByText(/Strukturierte Trainingsstunden/i),
    ).toBeInTheDocument();
  });

  it("zeigt die Kategorien auf der Homepage", async () => {
    renderWithProviders(<App />);

    // Wait for content to load - category should appear directly
    await waitFor(
      () => {
        expect(screen.getByText("Rücken")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("zeigt Navigation-Header mit RehaSport Logo", async () => {
    renderWithProviders(<App />);

    // Header should have logo text
    await waitFor(
      () => {
        expect(screen.getByText("RehaSport")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
