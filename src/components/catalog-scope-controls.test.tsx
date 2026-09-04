import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CatalogScopeControls } from "./catalog-scope-controls";

describe("CatalogScopeControls", () => {
  it("hides region selector and displays Sicily coastal provinces by default", () => {
    render(
      <CatalogScopeControls
        context="home"
        layout="two-column"
        province="all"
        nearbySelection={null}
        onProvinceChange={vi.fn()}
        onNearbyChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("combobox", { name: "Regione" })).not.toBeInTheDocument();
    const provinceSelect = screen.getByRole("combobox", { name: "Provincia" });
    expect(provinceSelect.parentElement).toHaveClass("col-start-1", "row-start-1", "lg:col-auto");
    expect(screen.getByTestId("nearby-control")).toHaveClass("col-start-2", "row-start-1", "lg:col-auto");

    // Contains Sicily coastal provinces
    expect(screen.getByRole("option", { name: "Palermo" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Trapani" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Messina" })).toBeInTheDocument();
    // Excludes other Italian regions/provinces when region filter is deactivated
    expect(screen.queryByRole("option", { name: "Milano" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Roma" })).not.toBeInTheDocument();
  });

  it("flattens into the shared mobile grid and orders nearby beside province when showRegion is enabled", () => {
    render(
      <CatalogScopeControls
        context="home"
        region="all"
        province="all"
        nearbySelection={null}
        onRegionChange={vi.fn()}
        onProvinceChange={vi.fn()}
        onNearbyChange={vi.fn()}
        showRegion={true}
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
        province="all"
        nearbySelection={{ coordinates: { latitude: 41.9, longitude: 12.5 }, radiusKm: 25 }}
        onProvinceChange={vi.fn()}
        onNearbyChange={vi.fn()}
      />,
    );

    const nearby = screen.getByTestId("nearby-control");
    expect(nearby).toHaveClass("w-full");
    expect(screen.getByRole("button", { name: "Vicino a me" })).toHaveClass("w-full", "px-4");
  });

  it("keeps region and province on the left and nearby on the right in the compact grid when showRegion is true", () => {
    render(
      <CatalogScopeControls
        context="home"
        layout="two-column"
        region="all"
        province="all"
        nearbySelection={null}
        onRegionChange={vi.fn()}
        onProvinceChange={vi.fn()}
        onNearbyChange={vi.fn()}
        showRegion={true}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Regione" }).parentElement).toHaveClass(
      "col-start-1",
      "row-start-1",
      "w-full",
    );
    expect(screen.getByRole("combobox", { name: "Provincia" }).parentElement).toHaveClass(
      "col-start-1",
      "row-start-2",
      "w-full",
    );
    expect(screen.getByTestId("nearby-control")).toHaveClass(
      "col-start-2",
      "row-start-1",
      "w-full",
    );
  });
});
