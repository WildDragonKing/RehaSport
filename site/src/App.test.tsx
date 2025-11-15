import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import App from "./App";
import { ThemeProvider } from "./components/theme/ThemeProvider";

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
    expect(html).toContain("Stunden-Ordner");
    expect(html).toContain("Ordner öffnen");
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

    expect(html).toContain("Aktive Übung");
    expect(html).toContain("Stabilität &amp; Mobilisation");
    expect(html).toContain("Übungsablauf");
  });
});
