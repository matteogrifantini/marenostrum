"use client";

import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";
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
  showRegion?: boolean;
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
  showRegion = false,
}: NationalMapViewProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [beachSearch, setBeachSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
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
  const searchResults = useMemo(() => {
    const normalizedQuery = beachSearch.trim().toLocaleLowerCase("it-IT");
    if (!normalizedQuery) return [];

    return recommendations
      .filter(({ beach }) => [
        beach.name,
        beach.municipality,
        beach.provinceCode ?? "",
        beach.provinceName ?? "",
      ].some((value) => value.toLocaleLowerCase("it-IT").includes(normalizedQuery)))
      .slice(0, 8);
  }, [beachSearch, recommendations]);
  const hasMapScope = Boolean(scope || region !== "all" || province !== "all" || nearbySelection);
  const needsScopeSelection = !hasMapScope && recommendations.length === 0;
  const displayScope = scope ?? (
    province !== "all"
      ? { kind: "province", provinceCode: province } as const
      : region !== "all"
        ? { kind: "region", regionCode: region } as const
        : null
  );
  const scopePromptTitle = showRegion
    ? "Scegli una regione per esplorare la mappa"
    : "Scegli una provincia per esplorare la mappa";
  const defaultScopePromptLabel = showRegion ? "Scegli una regione" : "Scegli una provincia";
  const scopeLabel = needsScopeSelection ? defaultScopePromptLabel : formatCatalogScopeLabel(displayScope);

  const handleMapSelectBeach = (slug: string) => {
    setSelectedSlug(slug);
    const selectedBeach = visibleMappableRecommendations.find(({ beach }) => beach.slug === slug)?.beach;
    if (selectedBeach) setBeachSearch(formatMapBeachLabel(selectedBeach));
  };

  const handleBeachSearchChange = (value: string) => {
    setBeachSearch(value);
    setSearchOpen(true);
    if (!value.trim()) setSelectedSlug(null);
  };

  const handleBeachSearchClear = () => {
    setBeachSearch("");
    setSelectedSlug(null);
    setSearchOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Controlli previsione mappa"
        className="relative z-20 overflow-visible rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.94)] p-3 shadow-[0_14px_44px_rgba(20,44,57,0.07)] backdrop-blur-xl sm:p-4 lg:p-3"
      >
        <div
          data-testid="map-control-layout"
          className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-2"
        >
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <DayPicker options={dateOptions} value={date} onChange={onDateChange} />
          </div>

          <div
            data-testid="map-filter-toolbar"
            className="grid gap-2 border-t border-[var(--line)] pt-3 lg:contents"
          >
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <PeriodPicker value={period} onChange={onPeriodChange} />
            </div>

            <div className="grid grid-cols-2 gap-2 lg:col-span-2 lg:grid-cols-3">
              <CatalogScopeControls
                context="map"
                layout="two-column"
                region={region}
                province={province}
                nearbySelection={nearbySelection}
                onRegionChange={onRegionChange}
                onProvinceChange={onProvinceChange}
                onNearbyChange={handleNearbyChange}
                showRegion={showRegion}
              />
              <button
                type="button"
                onClick={() => setFilterSheetOpen(true)}
                className="col-span-2 row-start-2 inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-full bg-[var(--surface)] px-3 text-sm font-bold text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] transition-[transform,background-color,color] duration-200 ease-out hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)] lg:col-auto lg:row-auto"
              >
                <SlidersHorizontal aria-hidden="true" size={16} />
                Filtri{activeFilterCount ? ` · ${activeFilterCount}` : ""}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 border-t border-[var(--line)] pt-3">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              size={18}
              strokeWidth={2.2}
            />
            <input
              id="map-beach-search"
              type="search"
              role="combobox"
              aria-label="Cerca una spiaggia sulla mappa"
              aria-autocomplete="list"
              aria-controls="map-beach-search-results"
              aria-expanded={searchOpen && beachSearch.trim().length > 0}
              value={beachSearch}
              onChange={(event) => handleBeachSearchChange(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchOpen(false);
                  event.currentTarget.blur();
                }
              }}
              placeholder="Cerca una spiaggia"
              className="min-h-11 w-full rounded-full bg-[var(--control-surface)] pl-11 pr-11 text-sm font-bold text-[var(--ink)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.06)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--muted)] focus:border-[var(--sun)] focus:ring-2 focus:ring-[rgba(255,194,71,0.26)]"
            />
            {beachSearch ? (
              <button
                type="button"
                aria-label="Cancella ricerca spiaggia"
                onClick={handleBeachSearchClear}
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--ink)] active:scale-90"
              >
                <X aria-hidden="true" size={15} />
              </button>
            ) : null}
            {searchOpen && beachSearch.trim() ? (
              <div
                id="map-beach-search-results"
                role="listbox"
                aria-label="Risultati ricerca spiaggia"
                className="absolute inset-x-0 top-[calc(100%+0.4rem)] z-30 max-h-64 overflow-auto rounded-[1rem] border border-[var(--line)] bg-white p-1.5 shadow-[0_16px_40px_rgba(20,44,57,0.16)]"
              >
                {searchResults.length > 0 ? searchResults.map(({ beach }) => (
                  <button
                    key={beach.slug}
                    type="button"
                    role="option"
                    aria-selected={selectedVisibleSlug === beach.slug}
                    onClick={() => handleMapSelectBeach(beach.slug)}
                    className="flex min-h-11 w-full items-center rounded-[0.75rem] px-3 text-left text-sm font-bold text-[var(--ink)] hover:bg-[var(--surface-muted)] focus-visible:bg-[var(--surface-muted)] focus-visible:outline-none"
                  >
                    {formatMapBeachLabel(beach)}
                  </button>
                )) : (
                  <p className="px-3 py-3 text-sm font-semibold text-[var(--muted)]">
                    Nessuna spiaggia trovata in questa selezione
                  </p>
                )}
              </div>
            ) : null}
          </div>
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

      {needsScopeSelection ? (
        <div
          data-testid="map-scope-prompt"
          role="note"
          aria-label="Come iniziare"
          className="flex items-start gap-3 rounded-[1.25rem] border border-[rgba(15,120,144,0.18)] bg-[var(--sea-soft)] p-4 text-[var(--ink)] shadow-[0_10px_28px_rgba(20,44,57,0.06)]"
        >
          <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--sea-deep)]" size={19} />
          <div>
            <p className="text-sm font-extrabold">{scopePromptTitle}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[var(--ink-soft)]">
              Dopo la selezione mostreremo spiagge, parcheggi, lidi e servizi della zona. Oppure usa Vicino a me.
            </p>
          </div>
        </div>
      ) : null}

      <section
        aria-label="Mappa delle spiagge"
        className="relative isolate overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[#d9e8e8] shadow-[0_16px_50px_rgba(20,44,57,0.1)]"
      >
        <LeafletBeachMap
          recommendations={visibleRecommendations}
          scope={scope}
          selectedSlug={selectedVisibleSlug}
          onSelectBeach={handleMapSelectBeach}
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
