import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  it("rendert ein Suchfeld", () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByRole("searchbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-label", "Übungen durchsuchen");
  });

  it("zeigt den aktuellen Wert an", () => {
    render(<SearchBar value="Test" onChange={() => {}} />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("Test");
  });

  it("ruft onChange bei Eingabe auf", () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "Schulter" } });

    expect(handleChange).toHaveBeenCalledWith("Schulter");
  });

  it("zeigt Löschen-Button nur bei Wert", () => {
    const { rerender } = render(<SearchBar value="" onChange={() => {}} />);

    expect(
      screen.queryByRole("button", { name: "Suche löschen" }),
    ).not.toBeInTheDocument();

    rerender(<SearchBar value="Test" onChange={() => {}} />);

    expect(
      screen.getByRole("button", { name: "Suche löschen" }),
    ).toBeInTheDocument();
  });

  it("leert das Feld beim Klick auf Löschen", () => {
    const handleChange = vi.fn();
    render(<SearchBar value="Test" onChange={handleChange} />);

    const clearButton = screen.getByRole("button", { name: "Suche löschen" });
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("verwendet benutzerdefinierten Placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Suchen..." />);

    const input = screen.getByPlaceholderText("Suchen...");
    expect(input).toBeInTheDocument();
  });

  it("verwendet Standard-Placeholder", () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const input = screen.getByPlaceholderText("Übungen suchen...");
    expect(input).toBeInTheDocument();
  });
});
