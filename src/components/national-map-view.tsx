"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import { formatScoreOutOf100 } from "../domain/score";
import {
  DEFAULT_BEACH_FILTERS,
  type BeachFilters,
} from "../domain/beach-filters";
import { MAP_POI_CATEGORIES, type MapPoiCategory } from "../domain/map-poi";
import { filterMapRecommendations, type MapNearbySelection } from "../domain/map-filtering";
import { sortMappableRecommendations } from "../domain/map-markers";
import type { DateOption } from "../domain/date-selection";
import type { CatalogScope } from "../domain/catalog-scope";
import { formatCatalogScopeLabel } from "../domain/catalog-scope";
import {
  filterRecommendationsByRegion,
  filterRecommendationsByProvince,
  type ProvinceSelection,
  type RegionSelection,
} from "../domain/province-filter";
import type { NearbySelection } from "./nearby-control";
import { CatalogScopeControls } from "./catalog-scope-controls";
import { DayPicker } from "./day-picker";
import { FilterSheet } from "./filter-sheet";
import { LeafletBeachMap } from "./leaflet-beach-map";
import { PeriodPicker } from "./period-picker";

type NationalMapViewProps = {
  recommendations: BeachRecommendation[];
  scope?: CatalogScope | null;
  region?: RegionSelection;
  province: ProvinceSelection;
  date: string;
  period: BeachPeriod;
  dateOptions: DateOption[];
  onDateChange: (date: string) => void;
  onPeriodChange: (period: BeachPeriod) => void;
  onRegionChange?: (region: RegionSelection) => void;
  onProvinceChange: (province: ProvinceSelection) => void;
  onNearbyChange?: (selection: NearbySelection | null) => void;
};

function formatMapBeachLabel(beach: BeachRecommendation["beach"]) {
  const provinceCode = beach.provinceCode?.trim().toUpperCase();
  return `${beach.name} · ${beach.municipality}${provinceCode ? ` (${provinceCode})` : ""}`;
}

function nearbySelectionFromScope(scope: CatalogScope | null): MapNearbySelection | null {
  return scope?.kind === "nearby"
    ? {
        coordinates: { latitude: scope.latitude, longitude: scope.longitude },
        radiusKm: scope.radiusKm,
      }
    : null;
}

export function NationalMapView({
  recommendations,
  scope = null,
  region = "all",
  province,
  date,
  period,
  dateOptions,
  onDateChange,
  onPeriodChange,
  onRegionChange = () => undefined,
  onProvinceChange,
  onNearbyChange,
}: NationalMapViewProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [filters, setFilters] = useState<BeachFilters>({ ...DEFAULT_BEACH_FILTERS });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [uncontrolledNearbySelection, setUncontrolledNearbySelection] = useState<MapNearbySelection | null>(
    () => nearbySelectionFromScope(scope),
  );
  const [poiEnabled, setPoiEnabled] = useState(false);
  const [activePoiCategories, setActivePoiCategories] = useState<MapPoiCategory[]>([...MAP_POI_CATEGORIES]);

  const nearbySelection = onNearbyChange
    ? nearbySelectionFromScope(scope)
    : uncontrolledNearbySelection;

  const togglePoiCategory = (category: MapPoiCategory) => {
    setActivePoiCategories((current) =>
      current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category],
    );
  };

  const handleNearbyChange = (selection: NearbySelection | null) => {
    if (!onNearbyChange) {
      setUncontrolledNearbySelection(selection);
    }
    onNearbyChange?.(selection);
  };

  const scopeRecommendations = useMemo(
    () => filterRecommendationsByProvince(
      filterRecommendationsByRegion(recommendations, region),
      province,
    ),
    [province, recommendations, region],
  );
  const visibleRecommendations = useMemo(
    () => filterMapRecommendations([...scopeRecommendations], filters, nearbySelection),
    [filters, nearbySelection, scopeRecommendations],
  );
  const visibleMappableRecommendations = useMemo(
    () => sortMappableRecommendations([...visibleRecommendations]),
    [visibleRecommendations],
  );
  const activeFilterCount = filters.access.length + filters.tags.length + filters.services.length;
  const selectedVisibleSlug = selectedSlug && visibleMappableRecommendations.some(({ beach }) => beach.slug === selectedSlug)
    ? selectedSlug
    : null;
  const displayScope = scope ?? (
    province !== "all"
      ? { kind: "province", provinceCode: province } as const
      : region !== "all"
        ? { kind: "region", regionCode: region } as const
        : null
  );
  const scopeLabel = formatCatalogScopeLabel(displayScope);

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Controlli previsione mappa"
        className="relative z-20 overflow-visible rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.94)] p-3 shadow-[0_14px_44px_rgba(20,44,57,0.07)] backdrop-blur-xl sm:p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <DayPicker options={dateOptions} value={date} onChange={onDateChange} />
          <div
            data-testid="map-filter-toolbar"
            className="grid grid-cols-2 items-center gap-2 lg:flex lg:flex-wrap"
          >
            <PeriodPicker value={period} onChange={onPeriodChange} />
            <CatalogScopeControls
              context="map"
              region={region}
              province={province}
              nearbySelection={nearbySelection}
              onRegionChange={onRegionChange}
              onProvinceChange={onProvinceChange}
              onNearbyChange={handleNearbyChange}
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 border-t border-[var(--line)] pt-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
          <label className="flex min-h-11 min-w-0 items-center rounded-full bg-[var(--control-surface)] px-4 text-sm font-bold text-[var(--ink)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.06)]">
            <span className="sr-only">Cerca una spiaggia sulla mappa</span>
            <select
              aria-label="Cerca una spiaggia sulla mappa"
              value={selectedVisibleSlug ?? ""}
              onChange={(event) => setSelectedSlug(event.target.value || null)}
              className="min-h-11 w-full min-w-0 appearance-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--sun)]"
            >
              <option value="">Cerca una spiaggia sulla mappa</option>
              {visibleMappableRecommendations.map(({ beach }) => (
                <option key={beach.slug} value={beach.slug}>
                  {beach.name} · {beach.municipality}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--surface)] px-4 text-sm font-bold text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] transition-[transform,background-color,color] duration-200 ease-out hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
          >
            <SlidersHorizontal aria-hidden="true" size={16} />
            Filtri{activeFilterCount ? ` · ${activeFilterCount}` : ""}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
          <button
            type="button"
            aria-pressed={poiEnabled}
            onClick={() => setPoiEnabled(!poiEnabled)}
            className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-colors ${
              poiEnabled
                ? "bg-[var(--ink)] text-white shadow-sm"
                : "bg-[var(--control-surface)] text-[var(--ink-soft)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
            }`}
          >
            <span>🅿️🏖️</span>
            <span>{poiEnabled ? "Punti utili attivi" : "Mostra punti utili (Parcheggi, Lidi, Servizi)"}</span>
          </button>

          {poiEnabled ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                aria-pressed={activePoiCategories.includes("parking")}
                onClick={() => togglePoiCategory("parking")}
                className={`inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 font-bold transition-colors ${
                  activePoiCategories.includes("parking")
                    ? "bg-[var(--sun)] text-[var(--ink)]"
                    : "bg-[var(--surface-muted)] text-[var(--ink-soft)] opacity-60"
                }`}
              >
                <span>🅿️ Parcheggi</span>
              </button>
              <button
                type="button"
                aria-pressed={activePoiCategories.includes("lido")}
                onClick={() => togglePoiCategory("lido")}
                className={`inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 font-bold transition-colors ${
                  activePoiCategories.includes("lido")
                    ? "bg-[var(--sun)] text-[var(--ink)]"
                    : "bg-[var(--surface-muted)] text-[var(--ink-soft)] opacity-60"
                }`}
              >
                <span>🏖️ Lidi</span>
              </button>
              <button
                type="button"
                aria-pressed={activePoiCategories.includes("sea-service")}
                onClick={() => togglePoiCategory("sea-service")}
                className={`inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 font-bold transition-colors ${
                  activePoiCategories.includes("sea-service")
                    ? "bg-[var(--sun)] text-[var(--ink)]"
                    : "bg-[var(--surface-muted)] text-[var(--ink-soft)] opacity-60"
                }`}
              >
                <span>🚿 Servizi mare</span>
              </button>
            </div>
          ) : null}

          {nearbySelection ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs sm:ml-auto">
              <span className="font-bold text-[var(--ink)]">Distanza:</span>
              {[15, 25, 50, 100].map((radius) => {
                const isSelected = nearbySelection.radiusKm === radius;
                return (
                  <button
                    key={radius}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleNearbyChange({ ...nearbySelection, radiusKm: radius })}
                    className={`inline-flex min-h-8 items-center rounded-full px-2.5 font-bold transition-colors ${
                      isSelected
                        ? "bg-[var(--ink)] text-white shadow-sm"
                        : "bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {radius} km
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleNearbyChange(null)}
                className="inline-flex min-h-8 items-center rounded-full px-2 font-bold text-[var(--muted)] hover:text-red-600 active:scale-95"
                title="Disattiva filtro vicino a me"
              >
                ✕
              </button>
            </div>
          ) : null}
        </div>

      </section>

      <section
        aria-label="Mappa delle spiagge"
        className="relative isolate overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[#d9e8e8] shadow-[0_16px_50px_rgba(20,44,57,0.1)]"
      >
        <LeafletBeachMap
          recommendations={visibleRecommendations}
          scope={scope}
          selectedSlug={selectedVisibleSlug}
          onSelectBeach={setSelectedSlug}
          nearbySelection={nearbySelection}
          poiEnabled={poiEnabled}
          activePoiCategories={activePoiCategories}
        />
      </section>

      <section className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_12px_34px_rgba(20,44,57,0.06)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            data-testid="map-result-summary"
            className="text-sm font-bold text-[var(--ink)]"
          >
            {visibleMappableRecommendations.length}{" "}
            {visibleMappableRecommendations.length === 1 ? "spiaggia" : "spiagge"}
            {" · "}
            {scopeLabel}
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
            <span>80+ ottimo</span>
            <span>60–79 buono</span>
            <span>sotto 60 da valutare</span>
          </div>
        </div>

        {visibleMappableRecommendations.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Nessuna spiaggia corrisponde ai filtri
          </p>
        ) : (
          <details className="mt-3 rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3">
            <summary className="cursor-pointer text-sm font-bold text-[var(--ink)]">
              Elenco spiagge
            </summary>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Rating delle spiagge sulla mappa">
              {visibleMappableRecommendations.map(({ beach, score }) => (
                <button
                  key={beach.slug}
                  type="button"
                  aria-pressed={selectedVisibleSlug === beach.slug}
                  onClick={() => setSelectedSlug(beach.slug)}
                  className={`inline-flex min-h-10 items-center rounded-full px-3 text-sm font-bold transition-colors ${
                    selectedVisibleSlug === beach.slug
                      ? "bg-[var(--ink)] text-white"
                      : "bg-white text-[var(--ink)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.08)] hover:bg-[var(--surface)]"
                  }`}
                  title={`${formatScoreOutOf100(score)}/100`}
                >
                  {formatMapBeachLabel(beach)}
                </button>
              ))}
            </div>
          </details>
        )}
      </section>

      <FilterSheet
        open={filterSheetOpen}
        filters={filters}
        onClose={() => setFilterSheetOpen(false)}
        onChange={setFilters}
      />
    </div>
  );
}
