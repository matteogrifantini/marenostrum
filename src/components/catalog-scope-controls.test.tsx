import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CatalogScopeControls } from "./catalog-scope-controls";

describe("CatalogScopeControls", () => {
  it("flattens into the shared mobile grid and orders nearby beside province", () => {
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
    expect(controls).toHaveClass("contents", "lg:flex", "lg:w-auto");
    expect(screen.getByRole("combobox", { name: "Regione" }).parentElement).toHaveClass(
      "order-2",
      "w-full",
      "lg:order-none",
      "lg:w-auto",
    );
    expect(screen.getByRole("combobox", { name: "Provincia" }).parentElement).toHaveClass(
      "order-4",
      "w-full",
      "lg:order-none",
      "lg:w-auto",
    );
    expect(screen.getByTestId("nearby-control")).toHaveClass(
      "order-3",
      "w-full",
      "lg:order-none",
      "lg:w-auto",
    );
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
    expect(nearby).toHaveClass("order-3", "w-full", "lg:order-none", "lg:w-auto");
    expect(screen.getByRole("button", { name: "Vicino a me" })).toHaveClass("w-full", "px-4");
  });
});
