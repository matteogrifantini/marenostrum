"use client";

import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BeachCard } from "./beach-card";
import { DayPicker } from "./day-picker";
import { FilterSheet, type BeachFilters } from "./filter-sheet";
import { MobileNav } from "./mobile-nav";
import { PageShell } from "./page-shell";
import { PeriodPicker } from "./period-picker";
import {
  DEMO_DATE_OPTIONS,
  DEMO_TODAY,
  getDemoRecommendationsFor,
} from "../data/demo-beaches";
import type { BeachPeriod } from "../domain/beach";

type HomeExperienceProps = {
  initialDate: string;
  initialPeriod: BeachPeriod;
};

const DEFAULT_FILTERS: BeachFilters = { access: "all", service: "all" };

export function HomeExperience({ initialDate, initialPeriod }: HomeExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [date, setDate] = useState(initialDate || DEMO_TODAY);
  const [period, setPeriod] = useState<BeachPeriod>(initialPeriod);
  const [filters, setFilters] = useState<BeachFilters>(DEFAULT_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const selectedOption =
    DEMO_DATE_OPTIONS.find((option) => option.iso === date) ?? DEMO_DATE_OPTIONS[0];
  const recommendations = useMemo(
    () => getDemoRecommendationsFor({ date, period }),
    [date, period],
  );
  const filteredRecommendations = useMemo(
    () =>
      recommendations.filter(({ beach }) => {
        const accessMatches = filters.access === "all" || beach.access === filters.access;
        const serviceMatches =
          filters.service === "all" ||
          beach.services?.some((service) => service.toLowerCase().includes(filters.service));

        return accessMatches && serviceMatches;
      }),
    [filters, recommendations],
  );

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
      <main className="min-h-screen pb-24 md:pb-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <section className="relative mt-4 overflow-hidden rounded-[2rem] bg-[var(--ink)] text-white shadow-[0_24px_80px_rgba(20,44,57,0.16)] sm:mt-6">
            <Image
              src="/images/beaches/cala-del-gelsomino.jpg"
              alt="Panorama della costa sud-orientale della Sicilia"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_58%] opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,28,35,0.86)] via-[rgba(10,28,35,0.46)] to-[rgba(10,28,35,0.18)]" />
            <div className="relative flex min-h-[350px] flex-col justify-between p-5 sm:min-h-[430px] sm:p-10 lg:min-h-[500px] lg:p-12">
              <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                <span>Sicilia · condizioni per il mare</span>
              </div>

              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-semibold text-white/75">{selectedOption.label}</p>
                <h1 className="max-w-2xl font-serif text-[clamp(3.2rem,8vw,7.3rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
                  Trova il mare
                  <span className="block text-[var(--sun)]">giusto per te.</span>
                </h1>
              </div>
            </div>
          </section>

          <section className="relative z-10 mt-3 rounded-[1.5rem] bg-[rgba(255,253,248,0.96)] p-3 shadow-[0_18px_55px_rgba(20,44,57,0.12)] backdrop-blur-xl sm:p-4">
            <DayPicker options={DEMO_DATE_OPTIONS} value={date} onChange={handleDateChange} />
          </section>

          <section className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-3">
            <PeriodPicker value={period} onChange={handlePeriodChange} />
            <button
              type="button"
              onClick={() => setFilterSheetOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--surface)] px-4 text-sm font-bold text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] transition-[transform,background-color,color] duration-200 ease-out hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
            >
              <SlidersHorizontal aria-hidden="true" size={16} />
              Filtri
            </button>
          </section>

          <section id="classifica" className="scroll-mt-6 py-6 sm:py-8">
            {filteredRecommendations.length ? (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
                <BeachCard
                  recommendation={filteredRecommendations[0]}
                  date={date}
                  period={period}
                  featured
                />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                  {filteredRecommendations.slice(1).map((recommendation) => (
                    <BeachCard
                      key={recommendation.beach.slug}
                      recommendation={recommendation}
                      date={date}
                      period={period}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.75rem] bg-[var(--surface)] p-8 text-center shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
                <h3 className="font-serif text-3xl font-semibold tracking-[-0.05em]">
                  Nessuna spiaggia corrisponde
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Prova a rimuovere un filtro fattuale per vedere di nuovo tutte le condizioni disponibili.
                </p>
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-6 min-h-11 rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-white transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sea-deep)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
                >
                  Azzera filtri
                </button>
              </div>
            )}
          </section>

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
