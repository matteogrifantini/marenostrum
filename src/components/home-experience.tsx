"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { startTransition, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BeachCard } from "./beach-card";
import { DayPicker } from "./day-picker";
import { FilterSheet, type BeachFilters } from "./filter-sheet";
import { MobileNav } from "./mobile-nav";
import { PageShell } from "./page-shell";
import { PeriodPicker } from "./period-picker";
import { ForecastAttribution } from "./forecast-attribution";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import type { DateOption } from "../domain/date-selection";

type HomeExperienceProps = {
  initialDate: string;
  initialPeriod: BeachPeriod;
  dateOptions: DateOption[];
  recommendations: BeachRecommendation[];
  dataUnavailable?: boolean;
};

const DEFAULT_FILTERS: BeachFilters = { access: "all", service: "all" };

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

export function HomeExperience({
  initialDate,
  initialPeriod,
  dateOptions,
  recommendations,
  dataUnavailable = false,
}: HomeExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [date, setDate] = useState(initialDate);
  const [period, setPeriod] = useState<BeachPeriod>(initialPeriod);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BeachFilters>(DEFAULT_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setDate(initialDate);
      setPeriod(initialPeriod);
    });
  }, [initialDate, initialPeriod]);

  const filteredRecommendations = useMemo(
    () => {
      const normalizedSearchQuery = searchQuery.trim().toLowerCase();

      return recommendations.filter(({ beach }) => {
        const accessMatches = filters.access === "all" || beach.access === filters.access;
        const serviceMatches =
          filters.service === "all" ||
          beach.services?.some((service) => service.toLowerCase().includes(filters.service));
        const searchMatches =
          !normalizedSearchQuery ||
          [beach.name, beach.municipality, beach.coast].some((value) =>
            value.toLowerCase().includes(normalizedSearchQuery),
          );

        return accessMatches && serviceMatches && searchMatches;
      });
    },
    [filters, recommendations, searchQuery],
  );
  const forecastUnavailable = dataUnavailable || recommendations.length === 0;

  const updateQuery = (nextDate: string, nextPeriod: BeachPeriod) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("date", nextDate);
    nextParams.set("period", nextPeriod);
    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    updateQuery(nextDate, period);
  };

  const handlePeriodChange = (nextPeriod: BeachPeriod) => {
    setPeriod(nextPeriod);
    updateQuery(date, nextPeriod);
  };

  return (
    <PageShell>
      <main className="min-h-screen pb-24 lg:pb-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <section className="mt-4 sm:mt-6">
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
                className="min-h-14 w-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] pl-12 pr-5 text-base font-semibold text-[var(--ink)] shadow-[0_12px_34px_rgba(20,44,57,0.07)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--muted)] focus:border-[var(--sun)] focus:shadow-[0_14px_38px_rgba(20,44,57,0.11)] focus:ring-2 focus:ring-[rgba(242,183,5,0.22)]"
              />
            </div>
          </section>

          <section className="mt-3 overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,253,248,0.82)] p-3 shadow-[0_14px_44px_rgba(20,44,57,0.07)] backdrop-blur-xl sm:p-4 lg:flex lg:items-center lg:gap-3 lg:p-3">
            <DayPicker options={dateOptions} value={date} onChange={handleDateChange} />

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3 lg:mt-0 lg:shrink-0 lg:border-t-0 lg:pt-0">
              <PeriodPicker value={period} onChange={handlePeriodChange} />
              <button
                type="button"
                onClick={() => setFilterSheetOpen(true)}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--surface)] px-4 text-sm font-bold text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] transition-[transform,background-color,color] duration-200 ease-out hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
              >
                <SlidersHorizontal aria-hidden="true" size={16} />
                Filtri
              </button>
            </div>
          </section>

          <section id="classifica" className="scroll-mt-6 py-5 sm:py-7">
            {filteredRecommendations.length ? (
              <>
                <ul
                  aria-label="Spiagge consigliate"
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5"
                >
                  {filteredRecommendations.map((recommendation, index) => (
                    <li key={recommendation.beach.slug} className="min-w-0">
                      <BeachCard
                        recommendation={recommendation}
                        date={date}
                        period={period}
                        eager={index < 4}
                      />
                    </li>
                  ))}
                </ul>
                <ForecastTimestamp recommendations={filteredRecommendations} />
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
                    onClick={() => {
                      setSearchQuery("");
                      setFilters(DEFAULT_FILTERS);
                    }}
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
      />
      <MobileNav />
    </PageShell>
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
