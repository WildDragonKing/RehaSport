import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("rendert als Button mit onClick", () => {
    render(<Button>Klick mich</Button>);

    const button = screen.getByRole("button", { name: "Klick mich" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn", "btn-primary");
  });

  it("rendert als Link mit to-Prop", () => {
    render(
      <MemoryRouter>
        <Button to="/test">Zum Link</Button>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Zum Link" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveClass("btn", "btn-primary");
  });

  it("verwendet primary als Standard-Variant", () => {
    render(<Button>Standard</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn-primary");
  });

  it("wendet secondary-Variant korrekt an", () => {
    render(<Button variant="secondary">Sekundär</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn-secondary");
  });

  it("fügt zusätzliche className hinzu", () => {
    render(<Button className="extra-class">Mit Klasse</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn", "btn-primary", "extra-class");
  });

  it("setzt type='button' als Standard", () => {
    render(<Button>Standard</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("erlaubt type='submit' für Formulare", () => {
    render(<Button type="submit">Absenden</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("übergibt aria-label an Link", () => {
    render(
      <MemoryRouter>
        <Button to="/test" aria-label="Zugänglicher Link">
          Link
        </Button>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Zugänglicher Link" });
    expect(link).toBeInTheDocument();
  });
});
