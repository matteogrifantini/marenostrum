import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { getDateOptions } from "../domain/date-selection";
import { NationalMapView } from "./national-map-view";

describe("NationalMapView", () => {
  it("exposes an explicit national starting scope without regional branding", () => {
    render(
      <NationalMapView
        recommendations={demoRecommendations}
        region="all"
        province="all"
        scope={null}
        date="2026-08-20"
        period="all-day"
        dateOptions={getDateOptions(new Date("2026-08-20T08:00:00+02:00"))}
        onDateChange={vi.fn()}
        onPeriodChange={vi.fn()}
        onRegionChange={vi.fn()}
        onProvinceChange={vi.fn()}
        onNearbyChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("combobox", { name: "Regione della mappa" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Provincia della mappa" })).toHaveValue("all");
    expect(screen.getByTestId("map-result-summary")).toHaveTextContent("3 spiagge · Italia");
    expect(screen.queryByText("Tutta la Sicilia")).not.toBeInTheDocument();
  });
});
