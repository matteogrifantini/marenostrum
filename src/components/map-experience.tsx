"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "./page-shell";
import { MobileNav } from "./mobile-nav";
import { SicilyMapView } from "./sicily-map-view";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import type { DateOption } from "../domain/date-selection";
import {
  normalizeProvinceCode,
  type ProvinceSelection,
} from "../domain/province-filter";
import { MAP_PAGE_DESCRIPTION, MAP_PAGE_TITLE } from "../domain/seo/site-copy";

type MapExperienceProps = {
  initialDate: string;
  initialPeriod: BeachPeriod;
  initialProvince?: ProvinceSelection;
  dateOptions: DateOption[];
  recommendations: BeachRecommendation[];
  dataUnavailable?: boolean;
};

export function buildMapQueryHref({
  pathname,
  searchParams,
  date,
  period,
  province,
}: {
  pathname: string;
  searchParams: string;
  date: string;
  period: BeachPeriod;
  province: ProvinceSelection;
}) {
  const nextParams = new URLSearchParams(searchParams);
  nextParams.set("date", date);
  nextParams.set("period", period);
  if (province === "all") nextParams.delete("province");
  else nextParams.set("province", province);
  return `${pathname}?${nextParams.toString()}`;
}

export function MapExperience({
  initialDate,
  initialPeriod,
  initialProvince = "all",
  dateOptions,
  recommendations,
  dataUnavailable = false,
}: MapExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [date, setDate] = useState(initialDate);
  const [period, setPeriod] = useState<BeachPeriod>(initialPeriod);
  const [province, setProvince] = useState<ProvinceSelection>(initialProvince);

  useEffect(() => {
    startTransition(() => {
      setDate(initialDate);
      setPeriod(initialPeriod);
      setProvince(initialProvince);
    });
  }, [initialDate, initialPeriod, initialProvince]);

  const updateQuery = (
    nextDate: string,
    nextPeriod: BeachPeriod,
    nextProvince: ProvinceSelection = province,
  ) => {
    startTransition(() => {
      router.replace(
        buildMapQueryHref({
          pathname,
          searchParams: searchParams.toString(),
          date: nextDate,
          period: nextPeriod,
          province: nextProvince,
        }),
        { scroll: false },
      );
    });
  };

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    updateQuery(nextDate, period);
  };

  const handlePeriodChange = (nextPeriod: BeachPeriod) => {
    setPeriod(nextPeriod);
    updateQuery(date, nextPeriod);
  };

  const handleProvinceChange = (value: ProvinceSelection) => {
    const nextProvince = normalizeProvinceCode(value);
    setProvince(nextProvince);
    updateQuery(date, period, nextProvince);
  };

  return (
    <PageShell activeNav="mappa">
      <main className="min-h-screen pb-24 lg:pb-12">
        <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-8 sm:pt-6">
          <header className="mb-4">
            <h1 className="font-serif text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-3xl">
              {MAP_PAGE_TITLE}
            </h1>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)] sm:text-sm">
              {MAP_PAGE_DESCRIPTION}
            </p>
          </header>

          {dataUnavailable || recommendations.length === 0 ? (
            <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">
                Condizioni non disponibili
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Non riusciamo a caricare i dati della mappa in questo momento. Riprova tra qualche minuto.
              </p>
            </div>
          ) : (
            <SicilyMapView
              recommendations={recommendations}
              province={province}
              date={date}
              period={period}
              dateOptions={dateOptions}
              onDateChange={handleDateChange}
              onPeriodChange={handlePeriodChange}
              onProvinceChange={handleProvinceChange}
            />
          )}
        </div>
      </main>
      <MobileNav active="mappa" />
    </PageShell>
  );
}
