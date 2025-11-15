import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import App from "./App";
import { getSession } from "./content/sessions";

describe("App", () => {
  it("zeigt die Ordnerübersicht", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("RehaSport Reader");
    expect(html).toContain("Stunden-Ordner");
    expect(html).toContain("Ordner öffnen");
  });

  it("listet Stunden innerhalb eines Ordners", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/ordner/ruecken"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Stabilität &amp; Mobilisation");
    expect(html).toContain("Stunde öffnen");
    expect(html).toContain("Rücken, Rumpfstabilität");
  });

  it("zeigt die Details einer Stunde mit Übungen", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/ordner/ruecken/stabilitaet-und-mobilisation"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Aktive Übung");
    expect(html).toContain("Schulterkreisen");
    expect(html).toContain("Zur Übung");
  });

  it("listet verfügbare Übungen", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/uebungen"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Übungen entdecken");
    expect(html).toContain("Armkreisen");
    expect(html).toContain("Übung ansehen");
  });

  it("zeigt die Detailseite einer Übung", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/uebungen/schulterkreisen"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Übung");
    expect(html).toContain("Schulterkreisen");
    expect(html).toContain("Verwandte Übungen");
  });

  it("liefert Übungen aus dem Content", () => {
    const session = getSession("ruecken", "stabilitaet-und-mobilisation");
    expect(session).toBeDefined();
    expect(session?.exercises.length ?? 0).toBeGreaterThan(0);
  });
});
