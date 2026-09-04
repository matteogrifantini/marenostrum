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
  region: RegionSelection;
  province: ProvinceSelection;
  nearbySelection: NearbySelection | null;
  onRegionChange: (region: RegionSelection) => void;
  onProvinceChange: (province: ProvinceSelection) => void;
  onNearbyChange: (selection: NearbySelection | null) => void;
};

export function CatalogScopeControls({
  context,
  layout = "inline",
  region,
  province,
  nearbySelection,
  onRegionChange,
  onProvinceChange,
  onNearbyChange,
}: CatalogScopeControlsProps) {
  const isTwoColumnLayout = layout === "two-column";
  const suffix = context === "map" ? " della mappa" : "";
  const visibleProvinces = region === "all"
    ? ITALIAN_PROVINCES
    : ITALIAN_PROVINCES.filter((item) => item.regionCode === region);

  return (
    <div
      data-testid="catalog-scope-controls"
      className={isTwoColumnLayout ? "contents" : "contents lg:flex lg:w-auto lg:flex-wrap lg:items-center lg:gap-2"}
    >
      <label className={`${isTwoColumnLayout ? "col-start-1 row-start-1 lg:col-auto lg:row-auto" : "order-2 lg:order-none lg:w-auto lg:shrink-0"} inline-flex min-h-11 w-full min-w-0 items-center rounded-full bg-[var(--surface)] px-1 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] focus-within:ring-2 focus-within:ring-[var(--sun)]`}>
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

      <label className={`${isTwoColumnLayout ? "col-start-1 row-start-2 lg:col-auto lg:row-auto" : "order-4 lg:order-none lg:w-auto lg:shrink-0"} inline-flex min-h-11 w-full min-w-0 items-center rounded-full bg-[var(--surface)] px-1 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] focus-within:ring-2 focus-within:ring-[var(--sun)]`}>
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
        className={isTwoColumnLayout ? "col-start-2 row-start-1 w-full min-w-0 lg:col-auto lg:row-auto" : "order-3 w-full lg:order-none lg:w-auto"}
      />
    </div>
  );
}
