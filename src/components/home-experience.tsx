"use client";

import Image from "next/image";
import { Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BeachCard } from "./beach-card";
import { ContextControls, type Proximity } from "./context-controls";
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
import { getPeriodLabel } from "../domain/date-selection";
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
  const [proximity, setProximity] = useState<Proximity>("sicilia");
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

  const headingDay = selectedOption.label.toLowerCase();

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
            <div className="relative flex min-h-[390px] flex-col justify-between p-5 sm:min-h-[450px] sm:p-10 lg:min-h-[500px] lg:p-12">
              <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                <span>Sicilia · condizioni per il mare</span>
                <span className="hidden rounded-full border border-white/25 px-3 py-1.5 sm:inline-flex">
                  {getPeriodLabel(period)}
                </span>
              </div>

              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-semibold text-white/75">{selectedOption.label}</p>
                <h1 className="max-w-2xl font-serif text-[clamp(3.2rem,8vw,7.3rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
                  Trova il mare
                  <span className="block text-[var(--sun)]">giusto per te.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
                  Confronta vento, onde, temperatura e score delle spiagge siciliane per decidere dove andare oggi.
                </p>
                <label className="mt-7 flex min-h-12 max-w-md items-center gap-3 rounded-full bg-white/95 px-4 text-[var(--ink)] shadow-[0_12px_30px_rgba(10,28,35,0.16)]">
                  <Search aria-hidden="true" size={18} className="shrink-0 text-[var(--muted)]" />
                  <span className="sr-only">Cerca una spiaggia</span>
                  <input
                    type="search"
                    placeholder="Cerca una spiaggia"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="relative z-10 -mt-5 rounded-[1.5rem] bg-[rgba(255,253,248,0.96)] p-3 shadow-[0_18px_55px_rgba(20,44,57,0.12)] backdrop-blur-xl sm:p-4">
            <DayPicker options={DEMO_DATE_OPTIONS} value={date} onChange={handleDateChange} />
          </section>

          <section className="flex flex-col gap-4 border-b border-[var(--line)] py-5 sm:flex-row sm:items-center sm:justify-between">
            <PeriodPicker value={period} onChange={handlePeriodChange} />
            <ContextControls
              proximity={proximity}
              onProximityChange={setProximity}
              onOpenFilters={() => setFilterSheetOpen(true)}
            />
          </section>

          <section id="classifica" className="scroll-mt-6 py-10 sm:py-14">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sea-deep)]">
                  Consigliate {headingDay}
                </p>
                <h2 className="mt-2 font-serif text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                  Le migliori scelte di {headingDay}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  {filteredRecommendations.length} spiagge ordinate per condizioni del mare · {getPeriodLabel(period).toLowerCase()}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                <ShieldCheck aria-hidden="true" size={16} className="text-[var(--sea)]" />
                Dati leggibili e spiegati
              </div>
            </div>

            {filteredRecommendations.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredRecommendations.map((recommendation) => (
                  <BeachCard
                    key={recommendation.beach.slug}
                    recommendation={recommendation}
                    date={date}
                    period={period}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[1.75rem] bg-[var(--surface)] p-8 text-center shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
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

          <section id="come-funziona" className="grid gap-6 border-t border-[var(--line)] py-10 sm:py-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sea-deep)]">Il metodo</p>
              <h2 className="mt-2 max-w-md font-serif text-4xl font-semibold leading-[0.92] tracking-[-0.06em]">
                Un numero che puoi capire.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Leggiamo", "Vento, onde, meteo e accesso."],
                ["02", "Incrociamo", "Le condizioni del giorno e del periodo."],
                ["03", "Spieghiamo", "Perché una spiaggia è in alto oggi."],
              ].map(([number, title, copy]) => (
                <div key={number} className="rounded-[1.35rem] bg-[rgba(255,253,248,0.54)] p-5">
                  <span className="text-xs font-bold tracking-[0.18em] text-[var(--sun-dark)]">{number}</span>
                  <h3 className="mt-8 font-serif text-2xl font-semibold tracking-[-0.04em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </div>
              ))}
            </div>
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
