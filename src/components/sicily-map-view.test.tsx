import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { getDateOptions } from "../domain/date-selection";
import { SicilyMapView } from "./sicily-map-view";

describe("SicilyMapView", () => {
  const dateOptions = getDateOptions(new Date("2026-08-20T08:00:00+02:00"));

  it("keeps the selected date and period visible in the shared controls", () => {
    render(
      <SicilyMapView
        recommendations={demoRecommendations}
        date="2026-08-21"
        period="morning"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
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
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
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
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={onDateChange}
        onPeriodChange={onPeriodChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Domani" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Periodo" }), {
      target: { value: "afternoon" },
    });

    expect(onDateChange).toHaveBeenCalledWith("2026-08-21");
    expect(onPeriodChange).toHaveBeenCalledWith("afternoon");
  });

  it("keeps POI layers disabled by default and exposes toggle to activate them", () => {
    render(
      <SicilyMapView
        recommendations={demoRecommendations}
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
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
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
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
        date="2026-08-20"
        period="all-day"
        dateOptions={dateOptions}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
      />,
    );

    const beachSearch = screen.getByRole("combobox", {
      name: "Cerca una spiaggia sulla mappa",
    });
    expect(beachSearch).toHaveValue("");
    fireEvent.change(beachSearch, { target: { value: demoRecommendations[1].beach.slug } });
    expect(beachSearch).toHaveValue(demoRecommendations[1].beach.slug);

    fireEvent.click(screen.getByRole("button", { name: /Vicino a me/ }));
    expect(screen.getByRole("dialog", { name: "Filtro vicino a me" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Filtri/ }));
    expect(screen.getByRole("dialog", { name: "Affina la scelta" })).toBeInTheDocument();
  });

});
