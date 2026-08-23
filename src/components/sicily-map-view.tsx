"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import {
  DEFAULT_BEACH_FILTERS,
  type BeachFilters,
} from "../domain/beach-filters";
import { filterMapRecommendations, type MapNearbySelection } from "../domain/map-filtering";
import { hasMapCoordinates } from "../domain/map-markers";
import type { DateOption } from "../domain/date-selection";
import { DayPicker } from "./day-picker";
import { FilterSheet } from "./filter-sheet";
import { LeafletBeachMap } from "./leaflet-beach-map";
import { NearbyControl } from "./nearby-control";
import { PeriodPicker } from "./period-picker";

type SicilyMapViewProps = {
  recommendations: BeachRecommendation[];
  date: string;
  period: BeachPeriod;
  dateOptions: DateOption[];
  onDateChange: (date: string) => void;
  onPeriodChange: (period: BeachPeriod) => void;
};

export function SicilyMapView({
  recommendations,
  date,
  period,
  dateOptions,
  onDateChange,
  onPeriodChange,
}: SicilyMapViewProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [filters, setFilters] = useState<BeachFilters>({ ...DEFAULT_BEACH_FILTERS });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [nearbySelection, setNearbySelection] = useState<MapNearbySelection | null>(null);

  const visibleRecommendations = useMemo(
    () => filterMapRecommendations(recommendations, filters, nearbySelection),
    [filters, nearbySelection, recommendations],
  );
  const visibleMappableRecommendations = useMemo(
    () => visibleRecommendations.filter(hasMapCoordinates),
    [visibleRecommendations],
  );
  const activeFilterCount = filters.access.length + filters.tags.length + filters.services.length;
  const selectedVisibleSlug = selectedSlug && visibleMappableRecommendations.some(({ beach }) => beach.slug === selectedSlug)
    ? selectedSlug
    : null;

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Controlli previsione mappa"
        className="relative z-20 overflow-visible rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.94)] p-3 shadow-[0_14px_44px_rgba(20,44,57,0.07)] backdrop-blur-xl sm:p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <DayPicker options={dateOptions} value={date} onChange={onDateChange} />
          <PeriodPicker value={period} onChange={onPeriodChange} />
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
          <NearbyControl value={nearbySelection} onChange={setNearbySelection} />
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--surface)] px-4 text-sm font-bold text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] transition-[transform,background-color,color] duration-200 ease-out hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
          >
            <SlidersHorizontal aria-hidden="true" size={16} />
            Filtri{activeFilterCount ? ` · ${activeFilterCount}` : ""}
          </button>
        </div>

      </section>

      <section
        aria-label="Mappa delle spiagge"
        className="relative isolate overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[#d9e8e8] shadow-[0_16px_50px_rgba(20,44,57,0.1)]"
      >
        <LeafletBeachMap
          recommendations={visibleRecommendations}
          selectedSlug={selectedVisibleSlug}
          onSelectBeach={setSelectedSlug}
          nearbySelection={nearbySelection}
        />

        <div className="sr-only" aria-label="Rating delle spiagge sulla mappa">
          {visibleMappableRecommendations.map(({ beach, score }) => (
            <button
              key={beach.slug}
              type="button"
              aria-label={`Spiaggia ${beach.name}, voto ${(score / 10).toFixed(1)}`}
              aria-pressed={selectedVisibleSlug === beach.slug}
              onClick={() => setSelectedSlug(beach.slug)}
            >
              {beach.name}: {(score / 10).toFixed(1)}
            </button>
          ))}
        </div>
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
