"use client";

import type { NearbySelection } from "./nearby-control";
import { NearbyControl } from "./nearby-control";
import {
  ITALIAN_PROVINCES,
  ITALIAN_REGIONS,
  type ProvinceSelection,
  type RegionSelection,
} from "../domain/province-filter";

type CatalogScopeControlsProps = {
  context: "home" | "map";
  layout?: "inline" | "two-column";
  region?: RegionSelection;
  province: ProvinceSelection;
  nearbySelection: NearbySelection | null;
  onRegionChange?: (region: RegionSelection) => void;
  onProvinceChange: (province: ProvinceSelection) => void;
  onNearbyChange: (selection: NearbySelection | null) => void;
  showRegion?: boolean;
};

export function CatalogScopeControls({
  context,
  layout = "inline",
  region = "all",
  province,
  nearbySelection,
  onRegionChange,
  onProvinceChange,
  onNearbyChange,
  showRegion = false,
}: CatalogScopeControlsProps) {
  const isTwoColumnLayout = layout === "two-column";
  const suffix = context === "map" ? " della mappa" : "";
  const visibleProvinces = showRegion && region !== "all"
    ? ITALIAN_PROVINCES.filter((item) => item.regionCode === region)
    : ITALIAN_PROVINCES.filter((item) => item.regionCode === "IT-82" && item.code !== "EN");

  const selectedProvinceLabel =
    province === "all"
      ? "Scegli una provincia"
      : visibleProvinces.find((item) => item.code === province)?.label ?? province;

  const selectedRegionLabel =
    region === "all"
      ? "Scegli una regione"
      : ITALIAN_REGIONS.find((item) => item.code === region)?.label ?? region;

  return (
    <div
      data-testid="catalog-scope-controls"
      className={isTwoColumnLayout ? "contents" : "contents lg:flex lg:w-auto lg:flex-wrap lg:items-center lg:gap-2"}
    >
      {showRegion && onRegionChange ? (
        <label
          className={`${
            isTwoColumnLayout
              ? "col-start-1 row-start-1 lg:col-auto lg:row-auto"
              : "order-2 lg:order-none lg:w-auto lg:shrink-0"
          } relative inline-flex min-h-11 w-full min-w-0 cursor-pointer select-none items-center justify-center rounded-full bg-[var(--surface)] px-2.5 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] transition-[transform,background-color,color] duration-200 ease-out hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] active:scale-[0.98] focus-within:ring-2 focus-within:ring-[var(--sun)] sm:px-4 lg:w-auto lg:max-w-[11rem]`}
        >
          <span className="sr-only">Regione{suffix}</span>
          <span
            aria-hidden="true"
            className="pointer-events-none truncate text-center text-xs font-bold text-[var(--ink-soft)] sm:text-sm"
          >
            {selectedRegionLabel}
          </span>
          <select
            aria-label={`Regione${suffix}`}
            value={region}
            onChange={(event) => onRegionChange(event.target.value as RegionSelection)}
            className="absolute inset-0 size-full cursor-pointer appearance-none rounded-full opacity-0"
          >
            <option value="all">Scegli una regione</option>
            {ITALIAN_REGIONS.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label
        className={`${
          isTwoColumnLayout
            ? (showRegion ? "col-start-1 row-start-2" : "col-start-1 row-start-1") + " lg:col-auto lg:row-auto"
            : "order-4 lg:order-none lg:w-auto lg:shrink-0"
        } relative inline-flex min-h-11 w-full min-w-0 cursor-pointer select-none items-center justify-center rounded-full bg-[var(--surface)] px-2.5 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] transition-[transform,background-color,color] duration-200 ease-out hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] active:scale-[0.98] focus-within:ring-2 focus-within:ring-[var(--sun)] sm:px-4`}
      >
        <span className="sr-only">Provincia{suffix}</span>
        <span
          aria-hidden="true"
          className="pointer-events-none truncate text-center text-xs font-bold text-[var(--ink-soft)] sm:text-sm"
        >
          {selectedProvinceLabel}
        </span>
        <select
          aria-label={`Provincia${suffix}`}
          value={province}
          onChange={(event) => onProvinceChange(event.target.value as ProvinceSelection)}
          className="absolute inset-0 size-full cursor-pointer appearance-none rounded-full opacity-0"
        >
          <option value="all">Scegli una provincia</option>
          {visibleProvinces.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <NearbyControl
        value={nearbySelection}
        onChange={onNearbyChange}
        className={isTwoColumnLayout ? (showRegion ? "col-start-2 row-start-1" : "col-start-2 row-start-1") + " w-full min-w-0 lg:col-auto lg:row-auto" : "order-3 w-full lg:order-none lg:w-auto"}
      />
    </div>
  );
}
