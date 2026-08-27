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
  it("uses a wide desktop frame for the hero and a readable frame for the details", () => {
    renderDetail();

    const hero = screen.getAllByRole("heading", { name: beach.name })[0].closest("section");
    expect(hero).not.toBeNull();
    expect(hero?.parentElement).toHaveClass("max-w-[1440px]");
    expect(hero?.parentElement?.children[1]).toHaveClass("max-w-[48rem]");
  });

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

    expect(dayControls).toHaveClass("day-picker", "bg-[var(--control-surface)]", "grid-cols-4");
    expect(periodControls).toHaveClass("period-picker", "mt-3", "bg-[var(--control-surface)]", "grid-cols-3");
    expect(screen.getByRole("button", { name: "Tutto il giorno" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("informazioni generali")).not.toBeInTheDocument();
    expect(dayControls.compareDocumentPosition(advice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(dayControls.compareDocumentPosition(periodControls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(advice.compareDocumentPosition(periodControls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(advice).toHaveAttribute("data-score-tone", "excellent");
    expect(within(advice).getByText("100")).toBeInTheDocument();

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

    const sunnyEmoji = within(comparison).getByRole("img", { name: "Meteo Sereno" });
    const rainyEmoji = within(comparison).getByRole("img", { name: "Meteo Pioggia" });

    expect(sunnyEmoji).toHaveTextContent("☀️");
    expect(sunnyEmoji).toHaveClass("bg-[var(--sun-soft)]", "text-2xl");
    expect(rainyEmoji).toHaveTextContent("🌧️");
    expect(rainyEmoji).toHaveClass("bg-[var(--sea-soft)]", "text-2xl");
  });

  it("uses a darker text hierarchy inside the conditions card", () => {
    renderDetail({
      recommendation: {
        ...selected,
        conditions: { ...selected.conditions, weather: "poco nuvoloso" },
      },
    });

    const conditions = screen.getByRole("region", { name: "Condizioni meteo" });

    expect(within(conditions).getByText("Cielo · Poco nuvoloso")).toHaveClass("text-[var(--ink)]");
    expect(within(conditions).getByText("Vento")).toHaveClass("text-[var(--ink)]");
    expect(within(conditions).getByText("intensità regolare")).toHaveClass("text-[var(--ink-soft)]");
    expect(within(conditions).getByText("pioggia 72%").parentElement).toHaveClass("text-[var(--ink)]");
  });

  it("uses each period score for its summary card background", () => {
    renderDetail();

    const comparison = screen.getByRole("group", { name: "Confronto mattina e pomeriggio" });
    const morningCard = within(comparison).getByText("Mattina").parentElement?.parentElement;
    const afternoonCard = within(comparison).getByText("Pomeriggio").parentElement?.parentElement;

    expect(morningCard).toHaveClass("bg-[var(--score-good-soft)]");
    expect(afternoonCard).toHaveClass("bg-[var(--score-caution-soft)]");
  });

  it.each([
    ["morning", "83"],
    ["afternoon", "62"],
  ] as const)("shows the %s score instead of the all-day comparison", (period, score) => {
    renderDetail({ period, recommendation: selected });

    const advice = screen.getByRole("note", { name: "Il consiglio di Mare Nostrum" });
    expect(within(advice).getByText(score)).toBeInTheDocument();
    expect(within(advice).queryByText("100")).not.toBeInTheDocument();
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
    expect(within(conditionsPanel).getByLabelText("Temp. aria: 28°C")).toHaveTextContent("28°C");
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
    expect(screen.getAllByRole("heading", { name: beach.name })).toHaveLength(1);
    expect(screen.getByRole("region", { name: "La spiaggia" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Recensioni" })).toBeInTheDocument();
  });

  it("keeps beach information closed but visible, then opens and scrolls to it", () => {
    const originalScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });

    renderDetail();

    const triggers = screen.getAllByRole("button", { name: "Scopri la spiaggia" });
    const heroTrigger = triggers[0];
    const accordionTrigger = triggers[1];

    expect(screen.getByRole("region", { name: "La spiaggia" })).toBeInTheDocument();
    expect(accordionTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Sabbia chiara e ciottoli fini")).not.toBeInTheDocument();

    fireEvent.click(heroTrigger);

    expect(heroTrigger).toHaveAttribute("aria-expanded", "true");
    expect(accordionTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Sabbia chiara e ciottoli fini")).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    fireEvent.click(accordionTrigger);

    expect(screen.getAllByRole("button", { name: "Scopri la spiaggia" })[1]).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Sabbia chiara e ciottoli fini")).not.toBeInTheDocument();

    if (originalScrollIntoView) {
      Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScrollIntoView);
    } else {
      Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: undefined });
    }
  });

  it("renders safe empty states when the beach has no community fixture", () => {
    renderDetail({ detail: emptyBeachDetailContent });

    expect(screen.getAllByRole("heading", { name: beach.name })).toHaveLength(1);
    expect(screen.getByText("Nessuna segnalazione recente disponibile.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Webcam più vicina" })).not.toBeInTheDocument();
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
