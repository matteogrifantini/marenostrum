import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { BeachDetailExperience } from "./beach-detail-experience";

const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => "/spiagge/cala-del-gelsomino",
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("BeachDetailExperience", () => {
  it("renders the selected day and period as an immediate one-page forecast", () => {
    render(
      <BeachDetailExperience
        recommendation={demoRecommendations[0]}
        date="2026-08-15"
        period="all-day"
      />,
    );

    expect(screen.queryByRole("tablist", { name: "Dettagli spiaggia" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Periodo" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Oggi" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Domani" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Tutto il giorno" })).toHaveAttribute("aria-pressed", "true");

    const advice = screen.getByRole("note", { name: "Il consiglio di Mare Nostrum" });
    expect(within(advice).getByText("10.0")).toBeInTheDocument();
    expect(within(advice).getByText("Ottima scelta")).toBeInTheDocument();

    const conditions = screen.getByRole("region", { name: "Condizioni meteo" });
    for (const label of ["Vento", "Onde", "Acqua", "Meteo"]) {
      expect(within(conditions).getByText(label)).toBeInTheDocument();
    }
    expect(within(conditions).getByRole("group", { name: "Confronto mattina e pomeriggio" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Segnalazioni recenti" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Parcheggi vicini" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Informazioni generali" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Recensioni" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Foto aggiunte di recente" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Webcam più vicina" })).toBeInTheDocument();
  });

  it("updates the URL from the day and period selectors", () => {
    replaceMock.mockClear();
    render(
      <BeachDetailExperience
        recommendation={demoRecommendations[0]}
        date="2026-08-15"
        period="all-day"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-16&period=all-day",
    );

    fireEvent.click(screen.getByRole("button", { name: "Mattina" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-15&period=morning",
    );
  });

  it("removes the duplicated day-part comparison for a single period", () => {
    render(
      <BeachDetailExperience
        recommendation={demoRecommendations[0]}
        date="2026-08-15"
        period="morning"
      />,
    );

    expect(screen.getByRole("button", { name: "Mattina" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("group", { name: "Confronto mattina e pomeriggio" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Condizioni meteo" })).toBeInTheDocument();
  });
});
