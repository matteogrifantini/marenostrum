import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { getDateOptions } from "../domain/date-selection";
import type { BeachRecommendation } from "../domain/beach";
import { SicilyMapView } from "./sicily-map-view";

describe("SicilyMapView", () => {
  const dateOptions = getDateOptions(new Date("2026-08-20T08:00:00+02:00"));
  const provinceRecommendations: BeachRecommendation[] = [
    {
      beach: {
        slug: "mondello",
        name: "Mondello",
        municipality: "Palermo",
        provinceCode: "PA",
        coast: "Nord",
        description: "Ampia spiaggia urbana.",
        orientationDegrees: 350,
        shelter: ["scirocco"],
        tags: ["famiglie"],
        access: "facile",
        latitude: 38.1982,
        longitude: 13.3269,
      },
      conditions: {
        observedAt: "2026-08-20T08:00:00+02:00",
        sourceQuality: "high",
        windDirectionDegrees: 120,
        windSpeedKmh: 10,
        gustSpeedKmh: 15,
        waveHeightMeters: 0.4,
        weather: "sereno",
        temperatureCelsius: 29,
        date: "2026-08-20",
        period: "all-day",
      },
      score: 82,
      label: "Ottima",
      reason: "Mare calmo e vento favorevole.",
      confidence: "alta",
      factors: {
        wind: 28,
        sea: 29,
        weather: 25,
      },
    },
    {
      beach: {
        slug: "san-vito-lo-capo",
        name: "San Vito Lo Capo",
        municipality: "San Vito Lo Capo",
        provinceCode: "TP",
        coast: "Nord-ovest",
        description: "Baia ampia e sabbiosa.",
        orientationDegrees: 320,
        shelter: ["levante"],
        tags: ["relax"],
        access: "facile",
        latitude: 38.1756,
        longitude: 12.7342,
      },
      conditions: {
        observedAt: "2026-08-20T08:00:00+02:00",
        sourceQuality: "high",
        windDirectionDegrees: 85,
        windSpeedKmh: 14,
        gustSpeedKmh: 18,
        waveHeightMeters: 0.6,
        weather: "sereno",
        temperatureCelsius: 28,
        date: "2026-08-20",
        period: "all-day",
      },
      score: 76,
      label: "Buona",
      reason: "Condizioni generalmente favorevoli.",
      confidence: "alta",
      factors: {
        wind: 24,
        sea: 27,
        weather: 25,
      },
    },
  ];
  const duplicateNameRecommendations: BeachRecommendation[] = [
    {
      ...provinceRecommendations[0],
      beach: {
        ...provinceRecommendations[0].beach,
        slug: "cala-rossa-favignana",
        name: "Cala Rossa",
        municipality: "Favignana",
        provinceCode: "TP",
      },
    },
    {
      ...provinceRecommendations[1],
      beach: {
        ...provinceRecommendations[1].beach,
        slug: "cala-rossa-ustica",
        name: "Cala Rossa",
        municipality: "Ustica",
        provinceCode: "PA",
      },
    },
  ];

  it("keeps the selected date and period visible in the shared controls", () => {
    render(
      <SicilyMapView
        recommendations={demoRecommendations}
        province="all"
        date="2026-08-21"
        period="morning"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Domani" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("combobox", { name: "Periodo" })).toHaveValue("morning");
  });

  it("exposes only geolocated recommendations as accessible rating markers", () => {
    const recommendationWithoutCoordinates = {
      ...demoRecommendations[0],
      beach: {
        ...demoRecommendations[0].beach,
        latitude: undefined,
        longitude: undefined,
      },
    };

    render(
      <SicilyMapView
        recommendations={[recommendationWithoutCoordinates]}
        province="all"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: /Spiaggia Cala del Gelsomino, voto/ })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Mappa delle spiagge" })).toBeInTheDocument();
  });

  it("emits control changes without requiring a full page reload", () => {
    const onDateChange = vi.fn();
    const onPeriodChange = vi.fn();

    render(
      <SicilyMapView
        recommendations={demoRecommendations}
        province="all"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={onDateChange}
        onPeriodChange={onPeriodChange}
        onProvinceChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Periodo" }), {
      target: { value: "afternoon" },
    });

    expect(onDateChange).toHaveBeenCalledWith("2026-08-21");
    expect(onPeriodChange).toHaveBeenCalledWith("afternoon");
  });

  it("emits the selected province through the province change callback", () => {
    const onProvinceChange = vi.fn();

    render(
      <SicilyMapView
        recommendations={provinceRecommendations}
        province="all"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={onProvinceChange}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Provincia della mappa" }), {
      target: { value: "PA" },
    });

    expect(onProvinceChange).toHaveBeenCalledWith("PA");
  });

  it("keeps POI layers disabled by default and exposes toggle to activate them", () => {
    render(
      <SicilyMapView
        recommendations={demoRecommendations}
        province="all"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("region", { name: "Mappa delle spiagge" })).toBeInTheDocument();
    const toggleButton = screen.getByRole("button", { name: /Mostra punti utili/ });
    expect(toggleButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("button", { name: "🅿️ Parcheggi" })).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByRole("button", { name: /Punti utili attivi/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "🅿️ Parcheggi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "🏖️ Lidi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "🚿 Servizi mare" })).toBeInTheDocument();
  });

  it("shows numeric ratings without the explanatory score legend", () => {
    render(
      <SicilyMapView
        recommendations={demoRecommendations}
        province="all"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={vi.fn()}
      />,
    );

    expect(screen.queryByText("8+ ottimo")).not.toBeInTheDocument();
    expect(screen.queryByText("6–8 buono")).not.toBeInTheDocument();
    expect(screen.queryByText("<6 difficile")).not.toBeInTheDocument();
  });

  it("lets people choose a beach and open the nearby and factual filters", () => {
    render(
      <SicilyMapView
        recommendations={demoRecommendations}
        province="all"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={vi.fn()}
      />,
    );

    const beachSearch = screen.getByRole("combobox", {
      name: "Cerca una spiaggia sulla mappa",
    });
    expect(beachSearch).toHaveValue("");
    fireEvent.change(beachSearch, { target: { value: demoRecommendations[1].beach.slug } });
    expect(beachSearch).toHaveValue(demoRecommendations[1].beach.slug);

    expect(screen.getByRole("button", { name: /Vicino a me/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Filtri/ }));
    expect(screen.getByRole("dialog", { name: "Affina la scelta" })).toBeInTheDocument();
  });

  it("keeps province selection and exposes a visible deterministic beach list", () => {
    render(
      <SicilyMapView
        recommendations={provinceRecommendations}
        province="PA"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Provincia della mappa" })).toHaveValue("PA");
    expect(screen.getByTestId("map-result-summary")).toHaveTextContent(
      "1 spiaggia · Provincia di Palermo",
    );
    expect(screen.getByTestId("map-result-summary")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("button", { name: "Mondello · Palermo (PA)" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "San Vito Lo Capo" })).not.toBeInTheDocument();
  });

  it("announces the whole-island scope in the map result summary", () => {
    render(
      <SicilyMapView
        recommendations={provinceRecommendations}
        province="all"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId("map-result-summary")).toHaveTextContent(
      "2 spiagge · Tutta la Sicilia",
    );
  });

  it("starts the beach disclosure list collapsed", () => {
    render(
      <SicilyMapView
        recommendations={provinceRecommendations}
        province="all"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Elenco spiagge").closest("details")).not.toHaveAttribute("open");
  });

  it("keeps contextual beach buttons selectable when names collide", () => {
    render(
      <SicilyMapView
        recommendations={duplicateNameRecommendations}
        province="all"
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onProvinceChange={vi.fn()}
      />,
    );

    const favignanaButton = screen.getByRole("button", {
      name: "Cala Rossa · Favignana (TP)",
    });
    const usticaButton = screen.getByRole("button", {
      name: "Cala Rossa · Ustica (PA)",
    });

    expect(favignanaButton).toHaveAttribute("type", "button");
    expect(favignanaButton).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(favignanaButton);
    expect(favignanaButton).toHaveAttribute("aria-pressed", "true");
    expect(usticaButton).toHaveAttribute("aria-pressed", "false");
  });

});
