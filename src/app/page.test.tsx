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
    expect(screen.getByRole("button", { name: "Domani" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "lun 17" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "mar 18" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cala del Gelsomino" })).toBeInTheDocument();
    expect(screen.queryByText(/Consigliate/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Le migliori scelte/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));

    expect(screen.getAllByRole("link", { name: /scopri la spiaggia/i })[0]).toHaveAttribute(
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
    expect(screen.queryByRole("searchbox", { name: /cerca una spiaggia/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/confronta vento, onde, temperatura/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Il metodo")).not.toBeInTheDocument();
    expect(screen.queryByText("Famiglia")).not.toBeInTheDocument();
    expect(screen.queryByText("Selvaggia")).not.toBeInTheDocument();
    expect(screen.queryByText("Acqua calma")).not.toBeInTheDocument();
  });

  it("keeps the day selector below the hero instead of overlapping it", () => {
    render(
      <HomeExperience initialDate="2026-08-17" initialPeriod="all-day" />,
    );

    const dayPicker = screen.getByRole("group", { name: "Scegli il giorno" });
    const dayPickerSection = dayPicker.parentElement;

    expect(dayPickerSection).toHaveClass("mt-3");
    expect(dayPickerSection).not.toHaveClass("-mt-5");
  });
});
