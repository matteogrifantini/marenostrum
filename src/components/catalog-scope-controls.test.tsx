import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CatalogScopeControls } from "./catalog-scope-controls";

describe("CatalogScopeControls", () => {
  it("uses two mobile columns and starts nearby in the left column", () => {
    render(
      <CatalogScopeControls
        context="home"
        region="all"
        province="all"
        nearbySelection={null}
        onRegionChange={vi.fn()}
        onProvinceChange={vi.fn()}
        onNearbyChange={vi.fn()}
      />,
    );

    const controls = screen.getByTestId("catalog-scope-controls");
    expect(controls).toHaveClass("grid", "grid-cols-2", "w-full", "sm:flex", "sm:w-auto");
    expect(screen.getByRole("combobox", { name: "Regione" }).parentElement).toHaveClass("w-full");
    expect(screen.getByRole("combobox", { name: "Provincia" }).parentElement).toHaveClass("w-full");
    expect(screen.getByTestId("nearby-control")).toHaveClass("col-start-1", "w-full");
  });

  it("makes the active nearby control fill its mobile column without moving it", () => {
    render(
      <CatalogScopeControls
        context="home"
        region="all"
        province="all"
        nearbySelection={{ coordinates: { latitude: 41.9, longitude: 12.5 }, radiusKm: 25 }}
        onRegionChange={vi.fn()}
        onProvinceChange={vi.fn()}
        onNearbyChange={vi.fn()}
      />,
    );

    const nearby = screen.getByTestId("nearby-control");
    expect(nearby).toHaveClass("col-start-1", "w-full");
    expect(screen.getByRole("button", { name: "Vicino a me" })).toHaveClass("w-full", "px-4");
  });
});
