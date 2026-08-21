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
  it("shows stale-data copy without the routine timestamp", () => {
    renderDetail({ recommendation: { ...selected, confidence: "bassa" } });

    expect(screen.queryByText("aggiornate 10:45")).not.toBeInTheDocument();
    expect(screen.getByText("Dati non recenti: verifica le condizioni prima di partire.")).toBeInTheDocument();
  });

  it("renders compact attribution after the conditions section", () => {
    renderDetail();

    const conditions = screen.getByRole("region", { name: "Condizioni meteo" });
    const attribution = screen.getByRole("contentinfo", {
      name: "Attribuzione previsioni",
    });

    expect(
      conditions.compareDocumentPosition(attribution) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(attribution).toHaveTextContent("Fonti:");
    expect(
      screen.queryByText("Previsioni indicative: non usare per la navigazione."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Mare Nostrum aggrega ed elabora i dati.")).not.toBeInTheDocument();
  });

  it("renders the live rain probability and Rome-local observation time", () => {
    renderDetail();

    expect(screen.queryByRole("tablist", { name: "Dettagli spiaggia" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Oggi" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Domani" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Tutto il giorno" })).toHaveAttribute("aria-pressed", "true");
    const advice = screen.getByRole("note", { name: "Il consiglio di Mare Nostrum" });
    const dayControls = screen.getByRole("group", { name: "Scegli il giorno" });
    const periodControls = screen.getByRole("group", { name: "Scegli la fascia oraria" });
    const selectorShell = dayControls.parentElement?.parentElement;

    expect(dayControls).toHaveClass("bg-white/70", "p-1");
    expect(periodControls).toHaveClass("bg-white/70", "p-1");
    expect(dayControls).not.toHaveClass("shadow-[inset_0_0_0_1px_rgba(8,47,61,0.05)]");
    expect(selectorShell).not.toHaveClass("rounded-t-[1.65rem]");
    expect(selectorShell).not.toHaveClass("bg-[var(--sand)]");
    expect(screen.queryByText("informazioni generali")).not.toBeInTheDocument();
    expect(dayControls.compareDocumentPosition(advice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(advice.compareDocumentPosition(periodControls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(advice).toHaveAttribute("data-score-tone", "excellent");
    expect(within(advice).getByText("10.0")).toBeInTheDocument();

    const conditions = screen.getByRole("region", { name: "Condizioni meteo" });
    expect(within(conditions).getByText("pioggia 72%")).toBeInTheDocument();
    expect(within(conditions).getByRole("group", { name: "Confronto mattina e pomeriggio" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Segnalazioni recenti" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Parcheggi vicini" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Recensioni" })).toBeInTheDocument();
  });

  it("derives the conditions title and concise aggregate metrics from the active date", () => {
    const conditions = {
      ...selected.conditions,
      windSpeedKmh: 11.981818181818182,
      gustSpeedKmh: 29.700000000000003,
      waveHeightMeters: 0.29999999999999999,
      waterTemperatureCelsius: 29.700000000000003,
    };

    renderDetail({
      date: "2026-08-21",
      recommendation: { ...selected, conditions },
      morningRecommendation: {
        ...morning,
        conditions: { ...conditions, windSpeedKmh: 13.527272727272731 },
      },
      afternoonRecommendation: { ...afternoon, conditions },
    });

    const conditionsPanel = screen.getByRole("region", { name: "Condizioni meteo" });
    expect(within(conditionsPanel).getByRole("heading", { name: "Previsioni domani" })).toBeInTheDocument();
    expect(within(conditionsPanel).getByLabelText("Vento: NO · 12 km/h")).toHaveTextContent(
      "NO · 12 km/h",
    );
    expect(within(conditionsPanel).getByLabelText("Onde: 0.3 m")).toHaveTextContent("0.3 m");
    expect(within(conditionsPanel).getByLabelText("Acqua: 29.7°")).toHaveTextContent("29.7°");
    expect(within(conditionsPanel).getByText("Vento 13.5 km/h")).toBeInTheDocument();
    expect(within(conditionsPanel).getByText("Raffiche fino a 29.7 km/h")).toBeInTheDocument();
  });

  it("uses the short calendar label in the forecast title", () => {
    renderDetail({ date: "2026-08-23" });

    const conditionsPanel = screen.getByRole("region", { name: "Condizioni meteo" });
    expect(within(conditionsPanel).getByRole("heading", { name: "Previsioni dom 23" })).toBeInTheDocument();
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
      { scroll: false },
    );

    fireEvent.click(screen.getByRole("button", { name: "Mattina" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-20&period=morning",
      { scroll: false },
    );
  });

  it("navigates to the third and fourth Home dates while preserving the selected period", () => {
    replaceMock.mockClear();
    renderDetail({ period: "morning" });

    fireEvent.click(screen.getByRole("button", { name: "sab 22" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-22&period=morning",
      { scroll: false },
    );

    fireEvent.click(screen.getByRole("button", { name: "dom 23" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-23&period=morning",
      { scroll: false },
    );
  });
});
