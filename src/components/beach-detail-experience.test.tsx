import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyBeachDetailContent, getDemoBeachDetail } from "../data/demo-beach-details";
import type { BeachRecommendation } from "../domain/beach";
import { getDateOptions } from "../domain/date-selection";
import { BeachDetailExperience } from "./beach-detail-experience";

const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => "/spiagge/cala-del-gelsomino",
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

const dateOptions = getDateOptions(new Date("2026-08-20T08:00:00+02:00"));
const beach = {
  slug: "cala-del-gelsomino",
  name: "Cala del Gelsomino",
  municipality: "Noto",
  coast: "Sud-est",
  description: "Una baia luminosa.",
  orientationDegrees: 120,
  shelter: ["maestrale"],
  tags: ["relax"],
  access: "facile" as const,
  image: "/images/beaches/cala-del-gelsomino.jpg",
};
const selected: BeachRecommendation = {
  beach,
  conditions: {
    observedAt: "2026-08-20T08:45:00Z",
    sourceQuality: "high",
    windDirectionDegrees: 315,
    windSpeedKmh: 7,
    gustSpeedKmh: 10,
    waveHeightMeters: 0.2,
    weather: "pioggia",
    temperatureCelsius: 28,
    precipitationProbabilityPercent: 72,
    hourly: [],
  },
  score: 100,
  label: "Ottima scelta",
  reason: "Mare calmo.",
  confidence: "alta",
  factors: { wind: 100, sea: 100, weather: 100, access: 100, fit: 100 },
};
const morning: BeachRecommendation = { ...selected, score: 83 };
const afternoon: BeachRecommendation = {
  ...selected,
  score: 62,
  conditions: { ...selected.conditions, gustSpeedKmh: 28 },
};
const detail = getDemoBeachDetail(beach.slug)!;

function renderDetail(
  props: Partial<React.ComponentProps<typeof BeachDetailExperience>> = {},
) {
  return render(
    <BeachDetailExperience
      beach={beach}
      recommendation={selected}
      morningRecommendation={morning}
      afternoonRecommendation={afternoon}
      dateOptions={dateOptions}
      detail={detail}
      date="2026-08-20"
      period="all-day"
      {...props}
    />,
  );
}

describe("BeachDetailExperience", () => {
  it("renders the live rain probability and Rome-local observation time", () => {
    renderDetail();

    expect(screen.queryByRole("tablist", { name: "Dettagli spiaggia" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Oggi" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Domani" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Tutto il giorno" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("aggiornate 10:45")).toBeInTheDocument();

    const advice = screen.getByRole("note", { name: "Il consiglio di Mare Nostrum" });
    expect(within(advice).getByText("10.0")).toBeInTheDocument();

    const conditions = screen.getByRole("region", { name: "Condizioni meteo" });
    expect(within(conditions).getByText("pioggia 72%")).toBeInTheDocument();
    expect(within(conditions).getByRole("group", { name: "Confronto mattina e pomeriggio" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Segnalazioni recenti" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Parcheggi vicini" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Recensioni" })).toBeInTheDocument();
  });

  it("keeps the beach and community content visible when forecast data is unavailable", () => {
    renderDetail({
      recommendation: undefined,
      morningRecommendation: undefined,
      afternoonRecommendation: undefined,
      dataUnavailable: true,
    });

    expect(
      screen.getAllByText(
        "Condizioni temporaneamente non disponibili. Riprova tra qualche minuto.",
      ),
    ).toHaveLength(2);
    expect(screen.getAllByRole("heading", { name: beach.name })).toHaveLength(2);
    expect(screen.getByRole("region", { name: "Informazioni generali" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Recensioni" })).toBeInTheDocument();
  });

  it("renders safe empty states when the beach has no community fixture", () => {
    renderDetail({ detail: emptyBeachDetailContent });

    expect(screen.getAllByRole("heading", { name: beach.name })).toHaveLength(2);
    expect(screen.getByText("Nessuna segnalazione recente disponibile.")).toBeInTheDocument();
    expect(screen.getByText("Nessuna recensione disponibile per questa spiaggia.")).toBeInTheDocument();
    expect(screen.getByText("Nessuna webcam disponibile.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Guarda i video/ })).not.toBeInTheDocument();
  });

  it("updates the URL from the supplied day and period selectors", () => {
    replaceMock.mockClear();
    renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-21&period=all-day",
    );

    fireEvent.click(screen.getByRole("button", { name: "Mattina" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-20&period=morning",
    );
  });
});
