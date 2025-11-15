import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("zeigt die Startseite mit Hero und Navigation", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("RehaSport Zentrum");
    expect(html).toContain("RehaSport, der motiviert und wirkt");
    expect(html).toContain("Zu den Kursen");
  });

  it("zeigt die Kursübersicht mit Kurskarten", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/kurse"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Unsere Kursübersicht");
    expect(html).toContain("Rückenfit & Entspannung");
    expect(html).toContain("Cardio Sanft");
  });

  it("liefert Kontaktformular mit Pflichtfeldern", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/kontakt"]}>
        <App />
      </MemoryRouter>
    );

    expect(html).toContain("Kontakt & Anmeldung");
    expect(html).toContain("Name*");
    expect(html).toContain("Nachricht absenden");
  });
});
