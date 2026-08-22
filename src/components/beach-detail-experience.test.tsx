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
  factors: { wind: 100, sea: 100, weather: 100 },
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
      origin="detail"
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

  it("renders data sources after the complete beach detail", () => {
    const detailWithParkingSource = {
      ...detail,
      parkings: detail.parkings.map((parking) => ({
        ...parking,
        sourceUrl: "https://www.openstreetmap.org/way/123",
      })),
    };
    renderDetail({ detail: detailWithParkingSource });

    const conditions = screen.getByRole("region", { name: "Condizioni meteo" });
    const attribution = screen.getByRole("contentinfo", {
      name: "Attribuzione previsioni",
    });
    const reviews = screen.getByRole("region", { name: "Recensioni" });

    expect(
      reviews.compareDocumentPosition(attribution) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      conditions.compareDocumentPosition(attribution) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(attribution).toHaveTextContent("Fonti meteo:");
    expect(attribution).toHaveTextContent("Parcheggi:");
    expect(screen.getByRole("link", { name: "© OpenStreetMap contributors" })).toBeInTheDocument();
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
    const periodControls = screen.getByRole("group", { name: "Scegli la fascia oraria" });
    const advice = screen.getByRole("note", { name: "Il consiglio di Mare Nostrum" });
    const dayControls = screen.getByRole("group", { name: "Scegli il giorno" });

    expect(dayControls).toHaveClass("day-picker", "bg-[var(--surface-muted)]", "grid-cols-4");
    expect(periodControls).toHaveClass("period-picker", "mt-3", "bg-[var(--surface-muted)]", "grid-cols-3");
    expect(screen.getByRole("button", { name: "Tutto il giorno" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("informazioni generali")).not.toBeInTheDocument();
    expect(dayControls.compareDocumentPosition(advice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(dayControls.compareDocumentPosition(periodControls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(advice.compareDocumentPosition(periodControls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(advice).toHaveAttribute("data-score-tone", "excellent");
    expect(within(advice).getByText("10.0")).toBeInTheDocument();

    const conditions = screen.getByRole("region", { name: "Condizioni meteo" });
    expect(periodControls.compareDocumentPosition(conditions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(conditions).getByText("pioggia 72%")).toBeInTheDocument();
    expect(within(conditions).getByRole("group", { name: "Confronto mattina e pomeriggio" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Segnalazioni recenti" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Parcheggi vicini" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Recensioni" })).toBeInTheDocument();
  });

  it("shows the selected period immediately while the detail route is pending", () => {
    renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Mattina" }));

    expect(screen.getByRole("button", { name: "Mattina" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Tutto il giorno" })).toHaveAttribute("aria-pressed", "false");
  });

  it("uses the weather emoji for each all-day comparison period", () => {
    renderDetail({
      morningRecommendation: {
        ...morning,
        conditions: { ...morning.conditions, weather: "sereno" },
      },
      afternoonRecommendation: {
        ...afternoon,
        conditions: { ...afternoon.conditions, weather: "pioggia" },
      },
    });

    const comparison = screen.getByRole("group", { name: "Confronto mattina e pomeriggio" });

    expect(within(comparison).getByRole("img", { name: "Meteo Sereno" })).toHaveTextContent("☀️");
    expect(within(comparison).getByRole("img", { name: "Meteo Pioggia" })).toHaveTextContent("🌧️");
  });

  it.each([
    ["morning", "8.3"],
    ["afternoon", "6.2"],
  ] as const)("shows the %s score instead of the all-day comparison", (period, score) => {
    renderDetail({ period, recommendation: selected });

    const advice = screen.getByRole("note", { name: "Il consiglio di Mare Nostrum" });
    expect(within(advice).getByText(score)).toBeInTheDocument();
    expect(within(advice).queryByText("10.0")).not.toBeInTheDocument();
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
    expect(within(conditionsPanel).getByLabelText("Temp. aria: 28°")).toHaveTextContent("28°");
    expect(within(conditionsPanel).getByText("Cielo · Pioggia")).toBeInTheDocument();
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
    expect(screen.getByRole("region", { name: "La spiaggia" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Recensioni" })).toBeInTheDocument();
  });

  it("renders safe empty states when the beach has no community fixture", () => {
    renderDetail({ detail: emptyBeachDetailContent });

    expect(screen.getAllByRole("heading", { name: beach.name })).toHaveLength(2);
    expect(screen.getByText("Nessuna segnalazione recente disponibile.")).toBeInTheDocument();
    expect(screen.getByText("Nessuna recensione locale disponibile.")).toBeInTheDocument();
    expect(screen.getByText("Nessuna webcam disponibile.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Guarda i video/ })).not.toBeInTheDocument();
  });

  it("updates the URL from the supplied day and period selectors", () => {
    replaceMock.mockClear();
    renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-21&period=all-day&source=detail",
      { scroll: false },
    );

    fireEvent.click(screen.getByRole("button", { name: "Mattina" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-21&period=morning&source=detail",
      { scroll: false },
    );
  });

  it("navigates to the third and fourth Home dates while preserving the selected period", () => {
    replaceMock.mockClear();
    renderDetail({ period: "morning" });

    fireEvent.click(screen.getByRole("button", { name: "sab 22" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-22&period=morning&source=detail",
      { scroll: false },
    );

    fireEvent.click(screen.getByRole("button", { name: "dom 23" }));
    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-23&period=morning&source=detail",
      { scroll: false },
    );
  });

  it("preserves a homepage date until the detail date is changed", () => {
    renderDetail({ date: "2026-08-21", origin: "home" });

    expect(screen.getByRole("link", { name: "Torna alle spiagge" })).toHaveAttribute(
      "href",
      "/?date=2026-08-21&period=all-day#classifica",
    );

    fireEvent.click(screen.getByRole("button", { name: "sab 22" }));

    expect(replaceMock).toHaveBeenLastCalledWith(
      "/spiagge/cala-del-gelsomino?date=2026-08-22&period=all-day&source=detail",
      { scroll: false },
    );
    expect(screen.getByRole("link", { name: "Torna alle spiagge" })).toHaveAttribute(
      "href",
      "/?period=all-day#classifica",
    );
  });
});
