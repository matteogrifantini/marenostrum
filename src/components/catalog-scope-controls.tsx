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
  region: RegionSelection;
  province: ProvinceSelection;
  nearbySelection: NearbySelection | null;
  onRegionChange: (region: RegionSelection) => void;
  onProvinceChange: (province: ProvinceSelection) => void;
  onNearbyChange: (selection: NearbySelection | null) => void;
};

export function CatalogScopeControls({
  context,
  region,
  province,
  nearbySelection,
  onRegionChange,
  onProvinceChange,
  onNearbyChange,
}: CatalogScopeControlsProps) {
  const suffix = context === "map" ? " della mappa" : "";
  const visibleProvinces = region === "all"
    ? ITALIAN_PROVINCES
    : ITALIAN_PROVINCES.filter((item) => item.regionCode === region);

  return (
    <div
      data-testid="catalog-scope-controls"
      className="contents lg:flex lg:w-auto lg:flex-wrap lg:items-center lg:gap-2"
    >
      <label className="order-2 inline-flex min-h-11 w-full min-w-0 items-center rounded-full bg-[var(--surface)] px-1 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] focus-within:ring-2 focus-within:ring-[var(--sun)] lg:order-none lg:w-auto lg:shrink-0">
        <span className="sr-only">Regione{suffix}</span>
        <select
          aria-label={`Regione${suffix}`}
          value={region}
          onChange={(event) => onRegionChange(event.target.value as RegionSelection)}
          className="min-h-11 w-full min-w-0 appearance-none rounded-full bg-transparent px-3 py-2 text-sm font-bold text-[var(--ink-soft)] outline-none lg:w-auto lg:max-w-[11rem]"
        >
          <option value="all">Scegli una regione</option>
          {ITALIAN_REGIONS.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="order-4 inline-flex min-h-11 w-full min-w-0 items-center rounded-full bg-[var(--surface)] px-1 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] focus-within:ring-2 focus-within:ring-[var(--sun)] lg:order-none lg:w-auto lg:shrink-0">
        <span className="sr-only">Provincia{suffix}</span>
        <select
          aria-label={`Provincia${suffix}`}
          value={province}
          onChange={(event) => onProvinceChange(event.target.value as ProvinceSelection)}
          className="min-h-11 w-full min-w-0 appearance-none rounded-full bg-transparent px-3 py-2 text-sm font-bold text-[var(--ink-soft)] outline-none lg:w-auto lg:max-w-[12rem]"
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
        className="order-3 w-full lg:order-none lg:w-auto"
      />
    </div>
  );
}
