import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeExperience } from "../components/home-experience";
import type { BeachRecommendation } from "../domain/beach";
import { getDateOptions } from "../domain/date-selection";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

const dateOptions = getDateOptions(new Date("2026-08-20T08:00:00+02:00"));

const recommendations: BeachRecommendation[] = [
  {
    beach: {
      slug: "cala-del-gelsomino",
      name: "Cala del Gelsomino",
      municipality: "Noto",
      coast: "Sud-est",
      description: "Una baia luminosa.",
      orientationDegrees: 120,
      shelter: ["maestrale"],
      tags: ["relax"],
      access: "facile",
      image: "/images/beaches/cala-del-gelsomino.jpg",
      provinceCode: "SR",
    },
    conditions: {
      observedAt: "2026-08-20T08:00:00+02:00",
      sourceQuality: "high",
      windDirectionDegrees: 315,
      windSpeedKmh: 7,
      gustSpeedKmh: 10,
      waveHeightMeters: 0.2,
      weather: "sereno",
      temperatureCelsius: 28,
    },
    score: 100,
    label: "Ottima scelta",
    reason: "Mare calmo.",
    confidence: "alta",
    factors: { wind: 100, sea: 100, weather: 100 },
  },
  {
    beach: {
      slug: "tonnara-di-vendicari",
      name: "Tonnara di Vendicari",
      municipality: "Noto",
      coast: "Sud-est",
      description: "Costa aperta.",
      orientationDegrees: 160,
      shelter: ["tramontana"],
      tags: ["esplora"],
      access: "moderato",
      image: "/images/beaches/tonnara-di-vendicari.jpg",
      provinceCode: "SR",
    },
    conditions: {
      observedAt: "2026-08-20T08:00:00+02:00",
      sourceQuality: "high",
      windDirectionDegrees: 90,
      windSpeedKmh: 11,
      gustSpeedKmh: 16,
      waveHeightMeters: 0.4,
      weather: "poco nuvoloso",
      temperatureCelsius: 27,
    },
    score: 82,
    label: "Buona scelta",
    reason: "Condizioni favorevoli.",
    confidence: "alta",
    factors: { wind: 80, sea: 85, weather: 85 },
  },
  {
    beach: {
      slug: "spiaggia-della-marchesa",
      name: "Spiaggia della Marchesa",
      municipality: "Avola",
      coast: "Sud-est",
      description: "Sabbia e pineta.",
      orientationDegrees: 95,
      shelter: ["ponente"],
      tags: ["famiglie", "sabbia"],
      access: "facile",
      image: "/images/beaches/spiaggia-della-marchesa.jpg",
      provinceCode: "SR",
    },
    conditions: {
      observedAt: "2026-08-20T08:00:00+02:00",
      sourceQuality: "high",
      windDirectionDegrees: 45,
      windSpeedKmh: 9,
      gustSpeedKmh: 13,
      waveHeightMeters: 0.3,
      weather: "sereno",
      temperatureCelsius: 29,
    },
    score: 76,
    label: "Buona scelta",
    reason: "Mare piacevole.",
    confidence: "alta",
    factors: { wind: 78, sea: 80, weather: 82 },
  },
];

function renderHome(
  props: Partial<React.ComponentProps<typeof HomeExperience>> = {},
) {
  return render(
    <HomeExperience
      initialDate="2026-08-20"
      initialPeriod="all-day"
      dateOptions={dateOptions}
      recommendations={recommendations}
      {...props}
    />,
  );
}

describe("HomeExperience", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    replace.mockReset();
  });

  it("introduces the national catalog with a concise beach selection heading", () => {
    renderHome({ nationalPreview: true });

    expect(screen.getByRole("heading", { level: 1, name: "Meteo del mare in Italia" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Le spiagge in evidenza in Sicilia" })).toBeInTheDocument();
    expect(screen.queryByText("Selezione nazionale")).not.toBeInTheDocument();
    expect(screen.queryByText(/Scegli una regione o una provincia per restringere la ricerca/i)).not.toBeInTheDocument();
  });

  it("shows stale-data copy beside the forecast timestamp only for low confidence", () => {
    const staleRecommendation = { ...recommendations[0], confidence: "bassa" as const };

    renderHome({ recommendations: [staleRecommendation, ...recommendations.slice(1)] });

    const timestamp = screen.getByText("aggiornate 08:00");
    expect(timestamp.parentElement).toHaveTextContent(
      "Dati non recenti: verifica le condizioni prima di partire.",
    );
  });

  it("does not show stale-data copy for high-confidence forecasts", () => {
    renderHome();

    expect(
      screen.queryByText("Dati non recenti: verifica le condizioni prima di partire."),
    ).not.toBeInTheDocument();
  });

  it("renders attribution after the home ranking", () => {
    renderHome();

    const ranking = screen.getByRole("list", { name: "Spiagge consigliate" });
    const attribution = screen.getByRole("contentinfo", {
      name: "Attribuzione previsioni",
    });

    expect(
      ranking.compareDocumentPosition(attribution) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows four days and updates the beach links after the day refreshes", () => {
    const view = renderHome();

    expect(screen.getByRole("button", { name: "Oggi" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mare Nostrum, home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Domani" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "sab 22" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "dom 23" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cala del Gelsomino" })).toBeInTheDocument();
    expect(screen.queryByText(/Consigliate/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Le migliori scelte/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));

    expect(
      screen.getByRole("status", { name: "Aggiornamento spiagge" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Spiagge consigliate" })).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith(
      "/?date=2026-08-21&period=all-day",
      { scroll: false },
    );

    view.rerender(
      <HomeExperience
        initialDate="2026-08-21"
        initialPeriod="all-day"
        dateOptions={dateOptions}
        recommendations={recommendations}
      />,
    );

    expect(screen.getAllByRole("link", { name: /apri la scheda/i })[0]).toHaveAttribute(
      "href",
      expect.stringContaining("date=2026-08-21&period=all-day&source=home"),
    );
  });

  it("shows an inline loading state while a day change refreshes the beach list", () => {
    renderHome();

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));

    expect(
      screen.getByRole("status", { name: "Aggiornamento spiagge" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Spiagge consigliate" })).not.toBeInTheDocument();
  });

  it("filters and orders beaches by distance after location authorization", () => {
    const locatedRecommendations = [
      {
        ...recommendations[0],
        beach: { ...recommendations[0].beach, latitude: 36.8, longitude: 15.1 },
      },
      {
        ...recommendations[1],
        beach: { ...recommendations[1].beach, latitude: 37.2, longitude: 15.1 },
      },
      {
        ...recommendations[2],
        beach: { ...recommendations[2].beach, latitude: 36.9, longitude: 15.1 },
      },
    ];
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: 36.8,
              longitude: 15.1,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
          });
        },
      },
    });

    try {
      renderHome({ recommendations: locatedRecommendations });

      // Single click on "Vicino a me" immediately activates location
      fireEvent.click(screen.getByRole("button", { name: "Vicino a me" }));

      // Inline radius chips appear immediately
      expect(screen.getByRole("button", { name: "25 km" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "50 km" })).toBeInTheDocument();

      expect(screen.getByRole("heading", { name: "Cala del Gelsomino" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Spiaggia della Marchesa" })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Tonnara di Vendicari" })).not.toBeInTheDocument();

      // Click 50 km chip directly
      fireEvent.click(screen.getByRole("button", { name: "50 km" }));

      expect(screen.getByRole("heading", { name: "Tonnara di Vendicari" })).toBeInTheDocument();
    } finally {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: undefined,
      });
    }
  });

  it("uses the Mare Nostrum desktop navigation", () => {
    renderHome();

    const desktopNavigation = screen.getByRole("navigation", { name: "Navigazione desktop" });
    const desktopHeader = desktopNavigation.parentElement;

    expect(desktopNavigation).toBeInTheDocument();
    expect(desktopHeader).not.toBeNull();
    expect(within(desktopNavigation).getByRole("link", { name: "Spiagge" })).toHaveAttribute(
      "href",
      "/#classifica",
    );
    expect(
      within(desktopNavigation).queryByRole("button", {
        name: "Esplora, disponibile prossimamente",
      }),
    ).not.toBeInTheDocument();
    expect(
      within(desktopHeader!).queryByRole("status", { name: "Condizioni meteo aggiornate" }),
    ).not.toBeInTheDocument();
    expect(within(desktopHeader!).queryByText("Live")).not.toBeInTheDocument();
    expect(
      within(desktopHeader!).getByRole("link", { name: "Apri preferiti" }),
    ).toHaveAttribute("href", "/preferiti");
    expect(
      within(desktopHeader!).getByRole("link", { name: "Apri impostazioni e accesso" }),
    ).toHaveAttribute("href", "/impostazioni");
    expect(within(desktopNavigation).getByRole("link", { name: "Mappa" })).toHaveAttribute(
      "href",
      "/mappa",
    );
    expect(within(desktopNavigation).queryByText("Blog")).not.toBeInTheDocument();
    expect(within(desktopNavigation).queryByText("Regioni")).not.toBeInTheDocument();
    expect(within(desktopHeader!).queryByText("Italiano")).not.toBeInTheDocument();
    expect(within(desktopHeader!).queryByText("Impostazioni")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Esplora la costa" })).not.toBeInTheDocument();
  });

  it("keeps the decision controls compact and removes editorial clutter", () => {
    renderHome();

    expect(screen.getByRole("group", { name: "Periodo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tutto il giorno" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Filtri" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tutta la Sicilia" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vicino a me" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Distanza da me" })).not.toBeInTheDocument();
    expect(screen.queryByText(/confronta vento, onde, temperatura/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Il metodo")).not.toBeInTheDocument();
    expect(screen.queryByText("Famiglia")).not.toBeInTheDocument();
    expect(screen.queryByText("Selvaggia")).not.toBeInTheDocument();
    expect(screen.queryByText("Acqua calma")).not.toBeInTheDocument();
  });

  it("starts with search, filters the beach list, and removes the hero", () => {
    renderHome();

    const search = screen.getByRole("searchbox", { name: "Cerca una spiaggia" });

    expect(search).toHaveAttribute("placeholder", "Cerca una spiaggia");
    expect(screen.getByRole("group", { name: "Scegli il giorno" })).toBeInTheDocument();
    expect(screen.queryByText("Mare Nostrum · condizioni per il mare")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Trova il mare/i })).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "Vendicari" } });

    expect(screen.getByRole("heading", { name: "Tonnara di Vendicari" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Cala del Gelsomino" })).not.toBeInTheDocument();
  });

  it("supports multiple factual filters at the same time", () => {
    renderHome();

    fireEvent.click(screen.getByRole("button", { name: "Filtri" }));
    const dialog = screen.getByRole("dialog", { name: "Affina la scelta" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Sabbia" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Adatta alle famiglie" }));

    expect(screen.getByRole("heading", { name: "Spiaggia della Marchesa" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Cala del Gelsomino" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tonnara di Vendicari" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtri · 2" })).toBeInTheDocument();
  });

  it("keeps search and forecast controls centered instead of full-width on desktop", () => {
    renderHome();

    const search = screen.getByRole("searchbox", { name: "Cerca una spiaggia" });
    const dayGroup = screen.getByRole("group", { name: "Scegli il giorno" });

    expect(search.closest("section")).toHaveClass("mx-auto", "max-w-4xl");
    expect(dayGroup.closest("section")).toHaveClass("mx-auto", "max-w-4xl");
  });

  it("keeps the period and location filters in two columns on smaller screens", () => {
    renderHome();

    const toolbar = screen.getByTestId("home-filter-toolbar");
    expect(toolbar).toHaveClass("grid", "gap-2");
    expect(screen.getByRole("group", { name: "Periodo" })).toHaveClass(
      "grid",
      "grid-cols-3",
      "w-full",
    );
    expect(screen.queryByRole("combobox", { name: "Regione" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Provincia" }).parentElement).toHaveClass(
      "col-start-1",
      "row-start-1",
    );
    expect(screen.getByTestId("nearby-control")).toHaveClass("col-start-2", "row-start-1");
    expect(screen.getByRole("button", { name: "Filtri" })).toHaveClass("col-span-2", "row-start-2");
  });

  it("compacts the home toolbar into two rows on desktop", () => {
    renderHome();

    const layout = screen.getByTestId("home-control-layout");
    const toolbar = screen.getByTestId("home-filter-toolbar");
    const dayGroup = screen.getByRole("group", { name: "Scegli il giorno" });
    const periodGroup = screen.getByRole("group", { name: "Periodo" });
    const locationGrid = screen.getByTestId("catalog-scope-controls").parentElement;

    expect(layout).toHaveClass("lg:grid-cols-2", "lg:gap-2");
    expect(toolbar).toHaveClass("lg:contents");
    expect(dayGroup.parentElement).toHaveClass("lg:col-start-1", "lg:row-start-1");
    expect(periodGroup.parentElement).toHaveClass("lg:col-start-2", "lg:row-start-1");
    expect(locationGrid).toHaveClass("lg:col-span-2", "lg:grid-cols-3");
    expect(screen.queryByRole("combobox", { name: "Regione" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Provincia" }).parentElement).toHaveClass(
      "lg:col-auto",
      "lg:row-auto",
    );
    expect(screen.getByTestId("nearby-control")).toHaveClass("lg:col-auto", "lg:row-auto");
  });

  it("filters by province from the main bar and persists the selection in the URL", () => {
    renderHome();

    const province = screen.getByRole("combobox", { name: "Provincia" });
    expect(province).toHaveValue("all");

    fireEvent.change(province, { target: { value: "TP" } });

    expect(screen.getByRole("status", { name: "Aggiornamento spiagge" })).toBeInTheDocument();
    expect(replace).toHaveBeenLastCalledWith(
      "/?date=2026-08-20&period=all-day&province=TP",
      { scroll: false },
    );
  });

  it("activates single-click geolocation and renders radius chips", () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: 36.8,
              longitude: 15.1,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
          });
        },
      },
    });

    try {
      renderHome();

      fireEvent.click(screen.getByRole("button", { name: "Vicino a me" }));

      expect(screen.getByRole("button", { name: "15 km" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "25 km" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "50 km" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "100 km" })).toBeInTheDocument();
    } finally {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: undefined,
      });
    }
  });

  it("uses a compact two-column beach grid without a featured card", () => {
    renderHome();

    const list = screen.getByRole("list", { name: "Spiagge consigliate" });

    expect(list).toHaveClass("grid-cols-2");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    screen.getAllByRole("img").forEach((image) => {
      expect(image).toHaveAttribute("loading", "eager");
    });
    expect(screen.getAllByText("Noto")).toHaveLength(2);
    expect(screen.getByText("Avola")).toBeInTheDocument();
  });

  it("synchronizes local controls when navigation provides a new server response", () => {
    const { rerender } = renderHome();

    rerender(
      <HomeExperience
        initialDate="2026-08-21"
        initialPeriod="morning"
        dateOptions={dateOptions}
        recommendations={recommendations}
      />,
    );

    expect(screen.getByRole("button", { name: "Domani" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Mattina" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the temporary-unavailable copy for unavailable forecast data", () => {
    renderHome({ recommendations: [], dataUnavailable: true });

    expect(
      screen.getByText(
        "Condizioni temporaneamente non disponibili. Riprova tra qualche minuto.",
      ),
    ).toBeInTheDocument();
  });

  it("treats zero forecast recommendations as unavailable data without offering to clear filters", () => {
    renderHome({ recommendations: [] });

    expect(screen.getByRole("heading", { name: "Condizioni non disponibili" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Condizioni temporaneamente non disponibili. Riprova tra qualche minuto.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Azzera ricerca e filtri" })).not.toBeInTheDocument();
  });

  it("resets search, filters, nearby location and quick filters on clicking Azzera ricerca e filtri", () => {
    renderHome();

    // Type a query that yields no matches
    const searchInput = screen.getByRole("searchbox", { name: "Cerca una spiaggia" });
    fireEvent.change(searchInput, { target: { value: "xyznonexistentbeach" } });

    expect(screen.getByRole("heading", { name: "Nessuna spiaggia corrisponde" })).toBeInTheDocument();
    const resetButton = screen.getByRole("button", { name: "Azzera ricerca e filtri" });
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);

    expect(searchInput).toHaveValue("");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
