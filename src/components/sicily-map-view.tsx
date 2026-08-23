"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Search,
  Waves,
  Wind,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import type { DateOption } from "../domain/date-selection";
import { DayPicker } from "./day-picker";
import { PeriodPicker } from "./period-picker";
import { FavoriteToggle } from "./favorite-toggle";
import { versionedMediaUrl } from "../lib/media-url";

type SicilyMapViewProps = {
  recommendations: BeachRecommendation[];
  date: string;
  period: BeachPeriod;
  dateOptions: DateOption[];
  onDateChange: (date: string) => void;
  onPeriodChange: (period: BeachPeriod) => void;
};

type MappableRecommendation = BeachRecommendation & {
  beach: BeachRecommendation["beach"] & {
    latitude: number;
    longitude: number;
  };
};

// Calibrated bounding box for Sicily
// Coordinates: 36.4°N - 38.5°N, 11.8°E - 15.8°E
function getCoordinatesPercent(lat: number, lon: number) {
  const minLon = 11.8;
  const maxLon = 15.8;
  const minLat = 36.4;
  const maxLat = 38.5;

  const x = ((lon - minLon) / (maxLon - minLon)) * 100;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

  return {
    x: Math.max(4, Math.min(96, x)),
    y: Math.max(6, Math.min(94, y)),
  };
}

function hasMapCoordinates(
  recommendation: BeachRecommendation,
): recommendation is MappableRecommendation {
  const { latitude, longitude } = recommendation.beach;

  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  );
}

export function SicilyMapView({
  recommendations,
  date,
  period,
  dateOptions,
  onDateChange,
  onPeriodChange,
}: SicilyMapViewProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    recommendations[0]?.beach.slug ?? null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCalmOnly, setFilterCalmOnly] = useState(false);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(({ beach, score }) => {
      if (filterCalmOnly && score < 80) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        beach.name.toLowerCase().includes(q) ||
        beach.municipality.toLowerCase().includes(q) ||
        beach.coast.toLowerCase().includes(q)
      );
    });
  }, [recommendations, searchQuery, filterCalmOnly]);

  const selectedBeach = useMemo(() => {
    return (
      filteredRecommendations.find((r) => r.beach.slug === selectedSlug) ??
      filteredRecommendations[0] ??
      null
    );
  }, [filteredRecommendations, selectedSlug]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <section
        aria-label="Controlli previsione mappa"
        className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.92)] p-3 shadow-[0_14px_44px_rgba(20,44,57,0.07)] backdrop-blur-xl sm:p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <DayPicker
            options={dateOptions}
            value={date}
            onChange={onDateChange}
          />
          <div className="flex items-center gap-2">
            <PeriodPicker value={period} onChange={onPeriodChange} />
            <button
              type="button"
              onClick={() => setFilterCalmOnly((prev) => !prev)}
              aria-pressed={filterCalmOnly}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all sm:text-sm ${
                filterCalmOnly
                  ? "bg-[var(--score-good)] text-white shadow-[0_4px_14px_rgba(21,128,61,0.3)]"
                  : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <Sparkles size={15} aria-hidden="true" />
              <span>Solo mare calmo (8+)</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca spiaggia sulla mappa…"
            aria-label="Cerca spiaggia sulla mappa"
            className="min-h-11 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-10 pr-4 text-sm font-semibold text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--sun)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,194,71,0.25)]"
          />
        </div>
      </section>

      {/* Map + Detail Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        {/* Interactive Map Canvas */}
        <div className="relative min-h-[460px] overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-gradient-to-b from-[#dff2fc] via-[#eef8fe] to-[#d6effc] p-4 shadow-[0_16px_50px_rgba(20,44,57,0.08)] sm:min-h-[580px]">
          {/* Sea Labels & Grid Accents */}
          <div className="pointer-events-none absolute inset-0 select-none">
            <span className="absolute left-6 top-8 font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#0284c7]/40">
              Mar Tirreno
            </span>
            <span className="absolute bottom-8 left-8 font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#0284c7]/40">
              Canale di Sicilia
            </span>
            <span className="absolute right-6 top-1/3 font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#0284c7]/40">
              Mar Ionio
            </span>

            {/* Stylized Sicily Outline (SVG) */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full opacity-60"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Sicily Main Island Silhouette Approximation */}
              <path
                d="M 18,22 Q 28,14 42,16 Q 62,18 86,22 Q 91,28 88,42 Q 85,55 88,72 Q 82,82 72,86 Q 50,78 30,68 Q 18,52 14,35 Z"
                fill="#f4efe6"
                stroke="#d8cfbe"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
              {/* Egadi Islands */}
              <circle cx="11" cy="24" r="1.8" fill="#efe7d8" stroke="#d8cfbe" strokeWidth="0.5" />
              <circle cx="9" cy="26" r="1.4" fill="#efe7d8" stroke="#d8cfbe" strokeWidth="0.5" />
              {/* Eolie Islands */}
              <circle cx="75" cy="10" r="1.6" fill="#efe7d8" stroke="#d8cfbe" strokeWidth="0.5" />
              <circle cx="82" cy="8" r="1.8" fill="#efe7d8" stroke="#d8cfbe" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Beach Pins */}
          <div className="relative h-full min-h-[420px] w-full sm:min-h-[520px]">
            {filteredRecommendations
              .filter(hasMapCoordinates)
              .map((item) => {
                const { beach, score, conditions } = item;
                const { x, y } = getCoordinatesPercent(beach.latitude, beach.longitude);
                const isSelected = selectedBeach?.beach.slug === beach.slug;
                const scoreVal = (score / 10).toFixed(1);
                const toneClass =
                  score >= 80
                    ? "bg-[var(--score-good)] text-white ring-[var(--score-good)]/30"
                    : score >= 60
                    ? "bg-[var(--score-fair)] text-white ring-[var(--score-fair)]/30"
                    : "bg-[var(--score-poor)] text-white ring-[var(--score-poor)]/30";

                return (
                  <button
                    key={beach.slug}
                    type="button"
                    onClick={() => setSelectedSlug(beach.slug)}
                    aria-label={`Spiaggia ${beach.name}, voto ${scoreVal}`}
                    aria-pressed={isSelected}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className={`group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)] ${
                      isSelected ? "z-30 scale-125" : "z-10 hover:z-20 hover:scale-110"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1 rounded-full px-2 py-1 shadow-[0_6px_18px_rgba(20,44,57,0.22)] ring-4 transition-all ${toneClass} ${
                        isSelected ? "ring-8 ring-[var(--sun)]/80 scale-105" : ""
                      }`}
                    >
                      <span className="text-xs font-extrabold tracking-tight sm:text-sm">
                        {scoreVal}
                      </span>
                      <Compass
                        size={12}
                        style={{
                          transform: `rotate(${conditions.windDirectionDegrees}deg)`,
                        }}
                        className="shrink-0 transition-transform opacity-90"
                        aria-hidden="true"
                      />
                    </div>
                    {/* Pin label (visible when selected or hovered) */}
                    <span
                      className={`pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--ink)]/90 px-1.5 py-0.5 text-[0.65rem] font-bold text-white shadow-md transition-opacity ${
                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {beach.name}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-[0.7rem] font-bold text-[var(--ink)] shadow-md backdrop-blur-md">
            <span className="flex items-center gap-1 text-[var(--score-good)]">
              <span className="size-2.5 rounded-full bg-[var(--score-good)]" />
              8+ Mare calmo
            </span>
            <span className="flex items-center gap-1 text-[var(--score-fair)]">
              <span className="size-2.5 rounded-full bg-[var(--score-fair)]" />
              6-8 Poco mosso
            </span>
            <span className="flex items-center gap-1 text-[var(--score-poor)]">
              <span className="size-2.5 rounded-full bg-[var(--score-poor)]" />
              &lt;6 Mosso/Agitato
            </span>
          </div>
        </div>

        {/* Selected Beach Preview Card */}
        {selectedBeach ? (
          <aside
            aria-label="Dettaglio spiaggia selezionata"
            className="flex flex-col justify-between rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_16px_50px_rgba(20,44,57,0.08)]"
          >
            <div>
              {/* Header with image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[var(--surface-muted)] shadow-inner">
                {selectedBeach.beach.image ? (
                  <Image
                    src={versionedMediaUrl(selectedBeach.beach.image)}
                    alt={selectedBeach.beach.imageAlt ?? selectedBeach.beach.name}
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs font-semibold text-[var(--muted)]">
                    Foto non disponibile
                  </div>
                )}
                <div className="absolute right-3 top-3 z-10">
                  <FavoriteToggle
                    beachSlug={selectedBeach.beach.slug}
                    beachName={selectedBeach.beach.name}
                  />
                </div>
              </div>

              {/* Title & municipality */}
              <div className="mt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  <MapPin size={13} aria-hidden="true" />
                  <span>{selectedBeach.beach.municipality}</span>
                  <span>·</span>
                  <span>{selectedBeach.beach.coast}</span>
                </div>
                <h2 className="mt-1 font-serif text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
                  {selectedBeach.beach.name}
                </h2>
              </div>

              {/* Score Badge */}
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[var(--control-surface)] p-3">
                <div
                  className={`grid size-12 place-items-center rounded-full text-lg font-bold text-white shadow-sm ${
                    selectedBeach.score >= 80
                      ? "bg-[var(--score-good)]"
                      : selectedBeach.score >= 60
                      ? "bg-[var(--score-fair)]"
                      : "bg-[var(--score-poor)]"
                  }`}
                >
                  {(selectedBeach.score / 10).toFixed(1)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Voto Mare Nostrum
                  </p>
                  <p className="text-sm font-bold text-[var(--ink)]">
                    {selectedBeach.label}
                  </p>
                </div>
              </div>

              {/* Conditions Highlights */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-[var(--ink-soft)]">
                <div className="flex items-center gap-2 rounded-xl bg-[var(--surface-muted)] p-2.5">
                  <Wind size={15} className="text-[var(--sea-deep)]" aria-hidden="true" />
                  <span>{selectedBeach.conditions.windSpeedKmh} km/h</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[var(--surface-muted)] p-2.5">
                  <Waves size={15} className="text-[var(--sea-deep)]" aria-hidden="true" />
                  <span>{selectedBeach.conditions.waveHeightMeters ?? "0.3"} m onde</span>
                </div>
              </div>

              {/* Description preview */}
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                {selectedBeach.beach.description}
              </p>
            </div>

            {/* Action Link to Full Detail Page */}
            <div className="mt-5 border-t border-[var(--line)] pt-4">
              <Link
                href={`/spiagge/${selectedBeach.beach.slug}?date=${encodeURIComponent(
                  date,
                )}&period=${encodeURIComponent(period)}&source=home`}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(20,44,57,0.14)] transition-all hover:bg-[var(--sea-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)] active:scale-[0.98]"
              >
                <span>Vedi scheda completa</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
