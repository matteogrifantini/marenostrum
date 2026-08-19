import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeExperience } from "../components/home-experience";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("HomeExperience", () => {
  it("shows four days and updates the beach links when the day changes", () => {
    render(
      <HomeExperience initialDate="2026-08-15" initialPeriod="all-day" />,
    );

    expect(screen.getByRole("button", { name: "Oggi" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mare Nostrum, home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Domani" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "lun 17" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "mar 18" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cala del Gelsomino" })).toBeInTheDocument();
    expect(screen.queryByText(/Consigliate/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Le migliori scelte/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));

    expect(screen.getAllByRole("link", { name: /apri la scheda/i })[0]).toHaveAttribute(
      "href",
      expect.stringContaining("date=2026-08-16"),
    );
    expect(replace).toHaveBeenCalledWith("/?date=2026-08-16&period=all-day");
  });

  it("keeps the decision controls compact and removes editorial clutter", () => {
    render(
      <HomeExperience initialDate="2026-08-15" initialPeriod="all-day" />,
    );

    expect(screen.getByRole("combobox", { name: "Periodo" })).toHaveValue("all-day");
    expect(screen.getByRole("button", { name: "Filtri" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tutto il giorno" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mattina" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pomeriggio" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tutta la Sicilia" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Vicino a me" })).not.toBeInTheDocument();
    expect(screen.queryByText(/confronta vento, onde, temperatura/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Il metodo")).not.toBeInTheDocument();
    expect(screen.queryByText("Famiglia")).not.toBeInTheDocument();
    expect(screen.queryByText("Selvaggia")).not.toBeInTheDocument();
    expect(screen.queryByText("Acqua calma")).not.toBeInTheDocument();
  });

  it("starts with search, filters the beach list, and removes the hero", () => {
    render(
      <HomeExperience initialDate="2026-08-15" initialPeriod="all-day" />,
    );

    const search = screen.getByRole("searchbox", { name: "Cerca una spiaggia" });

    expect(search).toHaveAttribute("placeholder", "Cerca una spiaggia");
    expect(screen.getByRole("group", { name: "Scegli il giorno" })).toBeInTheDocument();
    expect(screen.queryByText("Mare Nostrum · condizioni per il mare")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Trova il mare/i })).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "Vendicari" } });

    expect(screen.getByRole("heading", { name: "Tonnara di Vendicari" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Cala del Gelsomino" })).not.toBeInTheDocument();
  });

  it("uses a compact two-column beach grid without a featured card", () => {
    render(
      <HomeExperience initialDate="2026-08-15" initialPeriod="all-day" />,
    );

    const list = screen.getByRole("list", { name: "Spiagge consigliate" });

    expect(list).toHaveClass("grid-cols-2");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    screen.getAllByRole("img").forEach((image) => {
      expect(image).toHaveAttribute("loading", "eager");
    });
    expect(screen.getByText("Noto · 18 km")).toBeInTheDocument();
    expect(screen.getByText("Avola · 12 km")).toBeInTheDocument();
    expect(screen.getByText("Noto · 14 km")).toBeInTheDocument();
  });
});
