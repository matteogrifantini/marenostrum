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

  it("does not render a map pin for a recommendation without coordinates", () => {
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

    expect(
      screen.queryByRole("button", {
        name: /Spiaggia Cala del Gelsomino, voto/,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cala del Gelsomino" })).toBeInTheDocument();
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
});
