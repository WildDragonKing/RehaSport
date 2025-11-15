import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("zeigt die Ordnerübersicht", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("RehaSport Reader");
    expect(html).toContain("Der RehaSport Reader bringt vorbereitete RehaSport-Stunden direkt auf den Bildschirm.");
    expect(html).toContain("Was du damit machen kannst");
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
    expect(html).toContain("aria-label=\"Übungsablauf\"");
    expect(html).toContain("Stabilität &amp; Mobilisation");
  });
});
