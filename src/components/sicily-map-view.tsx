"use client";

import { useMemo, useState } from "react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import {
  MAP_POI_CATEGORIES,
  type MapPoiCategory,
} from "../domain/map-poi";
import { hasMapCoordinates } from "../domain/map-markers";
import type { DateOption } from "../domain/date-selection";
import { DayPicker } from "./day-picker";
import { LeafletBeachMap } from "./leaflet-beach-map";
import { PeriodPicker } from "./period-picker";

type SicilyMapViewProps = {
  recommendations: BeachRecommendation[];
  date: string;
  period: BeachPeriod;
  dateOptions: DateOption[];
  onDateChange: (date: string) => void;
  onPeriodChange: (period: BeachPeriod) => void;
};

const poiLayerOptions: Array<{
  category: MapPoiCategory;
  label: string;
  emoji: string;
}> = [
  { category: "parking", label: "Parcheggi", emoji: "🅿️" },
  { category: "lido", label: "Lidi", emoji: "🏖️" },
  { category: "sea-service", label: "Servizi mare", emoji: "🚿" },
];

export function SicilyMapView({
  recommendations,
  date,
  period,
  dateOptions,
  onDateChange,
  onPeriodChange,
}: SicilyMapViewProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    recommendations.find(hasMapCoordinates)?.beach.slug ?? null,
  );
  const [activePoiCategories, setActivePoiCategories] = useState<MapPoiCategory[]>([
    ...MAP_POI_CATEGORIES,
  ]);

  const mappableRecommendations = useMemo(
    () => recommendations.filter(hasMapCoordinates),
    [recommendations],
  );

  const togglePoiCategory = (category: MapPoiCategory) => {
    setActivePoiCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Controlli previsione mappa"
        className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.94)] p-3 shadow-[0_14px_44px_rgba(20,44,57,0.07)] backdrop-blur-xl sm:p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <DayPicker options={dateOptions} value={date} onChange={onDateChange} />
          <PeriodPicker value={period} onChange={onPeriodChange} />
        </div>

        <div className="mt-3 flex flex-col gap-2 border-t border-[var(--line)] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
            Punti utili sulla mappa
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Layer punti utili">
            {poiLayerOptions.map((option) => {
              const selected = activePoiCategories.includes(option.category);

              return (
                <button
                  key={option.category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => togglePoiCategory(option.category)}
                  className={[
                    "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-extrabold transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
                    selected
                      ? "border-[var(--sea)] bg-[var(--sea-soft)] text-[var(--sea-deep)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--sea)] hover:text-[var(--sea-deep)]",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {option.emoji}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        aria-label="Mappa delle spiagge"
        className="relative isolate overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[#d9e8e8] shadow-[0_16px_50px_rgba(20,44,57,0.1)]"
      >
        <LeafletBeachMap
          recommendations={recommendations}
          selectedSlug={selectedSlug}
          onSelectBeach={setSelectedSlug}
          activePoiCategories={activePoiCategories}
        />

        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-white/95 px-3 py-2 text-[0.68rem] font-extrabold text-[var(--ink)] shadow-[0_8px_22px_rgba(20,44,57,0.16)] backdrop-blur-md sm:bottom-4 sm:left-4 sm:px-4 sm:py-2.5 sm:text-xs">
          <span className="flex items-center gap-1.5">
            <span className="map-legend-score map-legend-score--good" aria-hidden="true" />
            8+ ottimo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="map-legend-score map-legend-score--fair" aria-hidden="true" />
            6–8 buono
          </span>
          <span className="flex items-center gap-1.5">
            <span className="map-legend-score map-legend-score--poor" aria-hidden="true" />
            &lt;6 difficile
          </span>
        </div>

        <div className="sr-only" aria-label="Rating delle spiagge sulla mappa">
          {mappableRecommendations.map(({ beach, score }) => (
            <button
              key={beach.slug}
              type="button"
              aria-label={`Spiaggia ${beach.name}, voto ${(score / 10).toFixed(1)}`}
              aria-pressed={selectedSlug === beach.slug}
              onClick={() => setSelectedSlug(beach.slug)}
            >
              {beach.name}: {(score / 10).toFixed(1)}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
