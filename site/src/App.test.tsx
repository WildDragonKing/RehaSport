import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import App from "./App";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { getSession } from "./content/sessions";

describe("App", () => {
  it("zeigt die Ordnerübersicht", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toContain("RehaSport Reader");
    expect(html).toContain("Strukturierte Trainingsstunden");
    expect(html).toContain("Kategorien");
  });

  it("listet Stunden innerhalb eines Ordners", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/ordner/ruecken"]}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Stabilität &amp; Mobilisation");
    expect(html).toContain("Stunde öffnen");
    expect(html).toContain("Rücken, Rumpfstabilität");
  });

  it("zeigt die Details einer Stunde mit Übungen", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/ordner/ruecken/stabilitaet-und-mobilisation"]}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toContain("exercise--active");
    expect(html).toContain("Stabilität &amp; Mobilisation");
    expect(html).toContain("exercise-list");
    expect(html).toContain("Schulterkreisen");
    expect(html).toContain("session-phase");
  });

  it("listet verfügbare Übungen", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/uebungen"]}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Übungen entdecken");
    expect(html).toContain("Schulterkreisen");
    expect(html).toContain("Übung ansehen");
  });

  it("zeigt die Detailseite einer Übung", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/uebungen/schulterkreisen"]}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toContain("Übung");
    expect(html).toContain("Schulterkreisen");
    expect(html).toContain("Kategorie");
  });

  it("liefert Übungen aus dem Content", () => {
    const session = getSession("ruecken", "stabilitaet-und-mobilisation");
    expect(session).toBeDefined();
    expect(session?.exercises.length ?? 0).toBeGreaterThan(0);

    const html = renderToString(
      <MemoryRouter initialEntries={["/ordner/ruecken/stabilitaet-und-mobilisation"]}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(html).toContain("exercise-list");
    expect(html).toContain("Stabilität &amp; Mobilisation");
  });
});
