"use client";

import { LocateFixed, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BeachCard } from "./beach-card";
import { DayPicker } from "./day-picker";
import { FilterSheet } from "./filter-sheet";
import { MobileNav } from "./mobile-nav";
import {
  NearbyControl,
  getStoredNearbySelection,
  setStoredNearbySelection,
  type NearbySelection,
} from "./nearby-control";
import { PageShell } from "./page-shell";
import { PeriodPicker } from "./period-picker";
import { ForecastAttribution } from "./forecast-attribution";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import {
  DEFAULT_BEACH_FILTERS,
  matchesBeachFilters,
  type BeachFilters,
} from "../domain/beach-filters";
import type { DateOption } from "../domain/date-selection";
import { distanceKm } from "../lib/geo";
import {
  filterRecommendationsByProvince,
  normalizeProvinceCode,
  SICILIAN_PROVINCES,
  type ProvinceSelection,
} from "../domain/province-filter";
import { buildNationalLocationLabel } from "../domain/seo/site-copy";

type HomeExperienceProps = {
  initialDate: string;
  initialPeriod: BeachPeriod;
  initialProvince?: ProvinceSelection;
  dateOptions: DateOption[];
  recommendations: BeachRecommendation[];
  dataUnavailable?: boolean;
};

type DisplayRecommendation = {
  recommendation: BeachRecommendation;
  distanceKm?: number;
};

function formatObservedAt(observedAt: string) {
  const date = new Date(observedAt);

  if (Number.isNaN(date.getTime())) return "";

  const time = new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(date);

  return `aggiornate ${time}`;
}

const WIND_MAP: Record<string, string> = {
  N: "tramontana",
  NE: "grecale",
  E: "levante",
  SE: "scirocco",
  S: "ostro",
  SO: "libeccio",
  O: "ponente",
  NO: "maestrale",
};

export function HomeExperience({
  initialDate,
  initialPeriod,
  initialProvince = "all",
  dateOptions,
  recommendations,
  dataUnavailable = false,
}: HomeExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);
  const [date, setDate] = useState(initialDate);
  const [period, setPeriod] = useState<BeachPeriod>(initialPeriod);
  const [province, setProvince] = useState<ProvinceSelection>(initialProvince);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlySheltered, setOnlySheltered] = useState(false);
  const [onlyWebcam, setOnlyWebcam] = useState(false);
  const [filters, setFilters] = useState<BeachFilters>({ ...DEFAULT_BEACH_FILTERS });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [nearbySelection, setNearbySelection] = useState<NearbySelection | null>(() => getStoredNearbySelection());
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const localInteractionRef = useRef(false);

  const handleNearbyChange = (next: NearbySelection | null) => {
    setNearbySelection(next);
    setStoredNearbySelection(next);
  };

  useEffect(() => {
    startTransition(() => {
      if (localInteractionRef.current) {
        localInteractionRef.current = false;
        setIsNavigating(false);
        return;
      }

      setDate(initialDate);
      setPeriod(initialPeriod);
      setProvince(initialProvince);
      setIsNavigating(false);
    });
  }, [initialDate, initialPeriod, initialProvince]);

  const filteredRecommendations = useMemo(
    () => {
      const normalizedSearchQuery = searchQuery.trim().toLowerCase();

      return filterRecommendationsByProvince(recommendations, province).filter((rec) => {
        const { beach, conditions } = rec;
        const searchMatches =
          !normalizedSearchQuery ||
          [
            beach.name,
            beach.municipality,
            beach.coast,
            beach.provinceCode ?? "",
            beach.description ?? "",
            ...(beach.tags ?? []),
            ...(beach.shelter ?? []),
            ...(beach.services ?? []),
          ].some((value) => value.toLowerCase().includes(normalizedSearchQuery));

        const shelterMatches = !onlySheltered || (() => {
          const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
          const normalized = ((conditions.windDirectionDegrees % 360) + 360) % 360;
          const direction = directions[Math.round(normalized / 45) % directions.length];
          const currentWindName = WIND_MAP[direction] ?? "";
          return Boolean(beach.shelter && beach.shelter.includes(currentWindName));
        })();

        const webcamMatches = !onlyWebcam || Boolean(beach.webcam);

        return matchesBeachFilters(beach, filters) && searchMatches && shelterMatches && webcamMatches;
      });
    },
    [filters, onlySheltered, onlyWebcam, province, recommendations, searchQuery],
  );
  const activeFilterCount =
    filters.access.length +
    filters.tags.length +
    filters.services.length +
    (onlySheltered ? 1 : 0) +
    (onlyWebcam ? 1 : 0);
  const forecastUnavailable = dataUnavailable || recommendations.length === 0;
  const isUpdatingForecast = isPending || isNavigating;
  const displayedRecommendations = useMemo<DisplayRecommendation[]>(() => {
    if (!nearbySelection) {
      return filteredRecommendations.map((recommendation) => ({ recommendation }));
    }

    return filteredRecommendations
      .flatMap((recommendation) => {
        const { latitude, longitude } = recommendation.beach;
        if (latitude == null || longitude == null) return [];

        const distance = distanceKm(
          nearbySelection.coordinates,
          { latitude, longitude },
        );
        if (distance > nearbySelection.radiusKm) return [];

        return [{
          recommendation,
          distanceKm: Math.round(distance * 10) / 10,
        }];
      })
      .sort((left, right) => (left.distanceKm ?? Infinity) - (right.distanceKm ?? Infinity));
  }, [filteredRecommendations, nearbySelection]);

  const filterKey = `${province}-${searchQuery}-${onlySheltered}-${onlyWebcam}-${date}-${period}-${nearbySelection?.radiusKm ?? "none"}-${JSON.stringify(filters)}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(12);
  }

  // Progressive infinite scrolling
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 12, displayedRecommendations.length));
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [displayedRecommendations.length]);

  const visibleRecommendations = useMemo(() => {
    return displayedRecommendations.slice(0, visibleCount);
  }, [displayedRecommendations, visibleCount]);

  const updateQuery = (
    nextDate: string,
    nextPeriod: BeachPeriod,
    nextProvince: ProvinceSelection = province,
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("date", nextDate);
    nextParams.set("period", nextPeriod);
    if (nextProvince === "all") nextParams.delete("province");
    else nextParams.set("province", nextProvince);
    setIsNavigating(true);
    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    });
  };

  const handleDateChange = (nextDate: string) => {
    localInteractionRef.current = true;
    setDate(nextDate);
    updateQuery(nextDate, period);
  };

  const handlePeriodChange = (nextPeriod: BeachPeriod) => {
    localInteractionRef.current = true;
    setPeriod(nextPeriod);
    updateQuery(date, nextPeriod);
  };

  const handleProvinceChange = (value: string) => {
    const nextProvince = normalizeProvinceCode(value);
    setProvince(nextProvince);
    updateQuery(date, period, nextProvince);
  };

  const handleResetAll = () => {
    setSearchQuery("");
    setOnlySheltered(false);
    setOnlyWebcam(false);
    setFilters({ ...DEFAULT_BEACH_FILTERS });
    handleNearbyChange(null);
    if (province !== "all") {
      handleProvinceChange("all");
    }
  };

  return (
    <PageShell>
      <main className="min-h-screen pb-24 lg:pb-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <section className="mx-auto mt-4 w-full max-w-4xl sm:mt-6">
            <label htmlFor="beach-search" className="sr-only">
              Cerca una spiaggia
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                size={19}
                strokeWidth={2.2}
              />
              <input
                id="beach-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cerca una spiaggia"
                aria-label="Cerca una spiaggia"
                className="min-h-14 w-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] pl-12 pr-12 text-base font-semibold text-[var(--ink)] shadow-[0_12px_34px_rgba(20,44,57,0.07)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--muted)] focus:border-[var(--sun)] focus:shadow-[0_14px_38px_rgba(20,44,57,0.11)] focus:ring-2 focus:ring-[rgba(255,194,71,0.26)]"
              />
              {searchQuery ? (
                <button
                  type="button"
                  aria-label="Cancella ricerca"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--ink)] active:scale-90"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>
          </section>

          <section
            aria-busy={isUpdatingForecast}
            className="relative z-20 mx-auto mt-3 w-full max-w-4xl overflow-visible rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.9)] p-3 shadow-[0_14px_44px_rgba(20,44,57,0.07)] backdrop-blur-xl sm:p-4"
          >
            <div className="lg:flex lg:items-center lg:gap-3">
              <DayPicker options={dateOptions} value={date} onChange={handleDateChange} />

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3 lg:mt-0 lg:shrink-0 lg:border-t-0 lg:pt-0">
                <PeriodPicker value={period} onChange={handlePeriodChange} />
                <label className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-[var(--surface)] px-1 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] focus-within:ring-2 focus-within:ring-[var(--sun)]">
                  <span className="sr-only">Provincia</span>
                  <select
                    aria-label="Provincia"
                    value={province}
                    onChange={(event) => handleProvinceChange(event.target.value)}
                    className="min-h-11 min-w-0 max-w-[11rem] appearance-none rounded-full bg-transparent px-3 py-2 text-sm font-bold text-[var(--ink-soft)] outline-none"
                  >
                    <option value="all">{buildNationalLocationLabel()}</option>
                    {SICILIAN_PROVINCES.map(({ code, label }) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </label>
                <NearbyControl value={nearbySelection} onChange={handleNearbyChange} />
                <button
                  type="button"
                  onClick={() => setFilterSheetOpen(true)}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--surface)] px-4 text-sm font-bold text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] transition-[transform,background-color,color] duration-200 ease-out hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
                >
                  <SlidersHorizontal aria-hidden="true" size={16} />
                  Filtri{activeFilterCount ? ` · ${activeFilterCount}` : ""}
                </button>
              </div>
            </div>
            {/* Inline Nearby Radius (Visible only when position is active) */}
            {nearbySelection && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-[var(--line)]/60 pt-2.5">
                <span className="flex items-center gap-1 text-xs font-bold text-[var(--ink)]">
                  <LocateFixed size={13} className="text-blue-500" aria-hidden="true" />
                  <span>Distanza:</span>
                </span>
                {[15, 25, 50, 100].map((radius) => {
                  const isSelected = nearbySelection.radiusKm === radius;
                  return (
                    <button
                      key={radius}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleNearbyChange({ ...nearbySelection, radiusKm: radius })}
                      className={`inline-flex min-h-8 items-center rounded-full px-2.5 text-xs font-bold transition-[transform,background-color,color] duration-150 active:scale-95 ${
                        isSelected
                          ? "bg-[var(--ink)] text-white shadow-sm"
                          : "bg-[var(--surface)] text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {radius} km
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleNearbyChange(null)}
                  className="inline-flex min-h-8 items-center rounded-full px-2 text-xs font-bold text-[var(--muted)] hover:text-red-600 active:scale-95"
                  title="Disattiva posizione"
                >
                  ✕
                </button>
              </div>
            )}
          </section>

          <section
            id="classifica"
            aria-busy={isUpdatingForecast}
            className="scroll-mt-6 py-5 sm:py-7"
          >
            {isUpdatingForecast ? (
              <BeachListLoading />
            ) : displayedRecommendations.length > 0 ? (
              <>
                <ul
                  aria-label="Spiagge consigliate"
                  data-testid="beach-ranking-grid"
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5"
                >
                  {visibleRecommendations.map(({ recommendation, distanceKm }, index) => (
                    <li key={recommendation.beach.slug} className="min-w-0">
                      <BeachCard
                        recommendation={recommendation}
                        date={date}
                        period={period}
                        distanceKm={distanceKm}
                        eager={index < 4}
                      />
                    </li>
                  ))}
                </ul>

                {/* Infinite Scroll Sentinel */}
                <div ref={loadMoreRef} className="h-1 w-full" aria-hidden="true" />

                {/* Manual Load More fallback if more items are available */}
                {visibleRecommendations.length < displayedRecommendations.length && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => Math.min(prev + 12, displayedRecommendations.length))}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--surface)] px-6 py-2.5 text-xs font-bold text-[var(--ink)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.08),0_4px_14px_rgba(20,44,57,0.05)] transition-[transform,background-color] hover:bg-[var(--surface-muted)] active:scale-95"
                    >
                      Mostra altre spiagge ({visibleRecommendations.length} di {displayedRecommendations.length})
                    </button>
                  </div>
                )}

                <ForecastTimestamp
                  recommendations={displayedRecommendations.map(({ recommendation }) => recommendation)}
                />
              </>
            ) : (
              <div className="rounded-[1.75rem] bg-[var(--surface)] p-8 text-center shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
                <h3 className="font-serif text-3xl font-semibold tracking-[-0.05em]">
                  {forecastUnavailable
                    ? "Condizioni non disponibili"
                    : "Nessuna spiaggia corrisponde"}
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                  {forecastUnavailable
                    ? "Condizioni temporaneamente non disponibili. Riprova tra qualche minuto."
                    : "Prova un altro nome, comune o costa, oppure rimuovi un filtro per vedere di nuovo tutte le condizioni disponibili."}
                </p>
                {!forecastUnavailable && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="mt-6 min-h-11 rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-white transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sea-deep)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
                  >
                    Azzera ricerca e filtri
                  </button>
                )}
              </div>
            )}
          </section>

          <ForecastAttribution />

        </div>
      </main>

      <FilterSheet
        open={filterSheetOpen}
        filters={filters}
        onClose={() => setFilterSheetOpen(false)}
        onChange={setFilters}
        onlySheltered={onlySheltered}
        onToggleSheltered={() => setOnlySheltered((prev) => !prev)}
        onlyWebcam={onlyWebcam}
        onToggleWebcam={() => setOnlyWebcam((prev) => !prev)}
      />
      <MobileNav />
    </PageShell>
  );
}

function BeachListLoading() {
  return (
    <div
      role="status"
      aria-label="Aggiornamento spiagge"
      aria-live="polite"
      className="rounded-[1.75rem] bg-[rgba(255,255,255,0.72)] p-3 shadow-[0_18px_60px_rgba(20,44,57,0.06)] sm:p-4"
    >
      <p className="sr-only">Aggiorno le condizioni delle spiagge…</p>
      <ul
        aria-hidden="true"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <li
            key={index}
            className="overflow-hidden rounded-[1.35rem] bg-[var(--surface)] shadow-[0_14px_44px_rgba(20,44,57,0.07)]"
          >
            <div className="aspect-[4/3] animate-pulse bg-[var(--surface-muted)]" />
            <div className="space-y-3 p-3 sm:p-4">
              <div className="h-5 w-3/4 animate-pulse rounded-full bg-[var(--surface-muted)]" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-[var(--surface-muted)]" />
              <div className="h-10 w-full animate-pulse rounded-2xl bg-[var(--surface-muted)]" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ForecastTimestamp({ recommendations }: { recommendations: BeachRecommendation[] }) {
  const staleRecommendation = recommendations.find(
    (recommendation) => recommendation.confidence === "bassa",
  );
  const recommendation = staleRecommendation ?? recommendations[0];
  const timestamp = formatObservedAt(recommendation.conditions.observedAt);

  if (!timestamp) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[0.68rem] leading-5 text-[var(--muted)]">
      <time dateTime={recommendation.conditions.observedAt}>{timestamp}</time>
      {staleRecommendation ? (
        <span>Dati non recenti: verifica le condizioni prima di partire.</span>
      ) : null}
    </div>
  );
}
