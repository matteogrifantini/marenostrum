"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "./page-shell";
import { MobileNav } from "./mobile-nav";
import { NationalMapView } from "./national-map-view";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import type { DateOption } from "../domain/date-selection";
import type { CatalogScope } from "../domain/catalog-scope";
import {
  normalizeProvinceCode,
  normalizeRegionCode,
  type ProvinceSelection,
  type RegionSelection,
} from "../domain/province-filter";
import type { NearbySelection } from "./nearby-control";
import { MAP_PAGE_DESCRIPTION, MAP_PAGE_TITLE } from "../domain/seo/site-copy";

type MapExperienceProps = {
  initialDate: string;
  initialPeriod: BeachPeriod;
  initialScope?: CatalogScope | null;
  initialRegion?: RegionSelection;
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
  scope,
}: {
  pathname: string;
  searchParams: string;
  date: string;
  period: BeachPeriod;
  scope: CatalogScope | null;
}) {
  const nextParams = new URLSearchParams(searchParams);
  nextParams.set("date", date);
  nextParams.set("period", period);
  nextParams.delete("region");
  nextParams.delete("province");
  nextParams.delete("lat");
  nextParams.delete("lng");
  nextParams.delete("radius");
  if (scope?.kind === "region") nextParams.set("region", scope.regionCode);
  if (scope?.kind === "province") nextParams.set("province", scope.provinceCode);
  if (scope?.kind === "nearby") {
    nextParams.set("lat", scope.latitude.toFixed(6));
    nextParams.set("lng", scope.longitude.toFixed(6));
    nextParams.set("radius", scope.radiusKm.toString());
  }
  return `${pathname}?${nextParams.toString()}`;
}

export function MapExperience({
  initialDate,
  initialPeriod,
  initialScope = null,
  initialRegion,
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
  const [scope, setScope] = useState<CatalogScope | null>(initialScope);
  const [region, setRegion] = useState<RegionSelection>(
    initialRegion ?? (initialScope?.kind === "region" ? normalizeRegionCode(initialScope.regionCode) : "all"),
  );
  const [province, setProvince] = useState<ProvinceSelection>(
    initialScope?.kind === "province"
      ? normalizeProvinceCode(initialScope.provinceCode)
      : initialProvince,
  );

  useEffect(() => {
    startTransition(() => {
      setDate(initialDate);
      setPeriod(initialPeriod);
      setScope(initialScope);
      setRegion(initialRegion ?? (initialScope?.kind === "region" ? normalizeRegionCode(initialScope.regionCode) : "all"));
      setProvince(initialScope?.kind === "province" ? normalizeProvinceCode(initialScope.provinceCode) : initialProvince);
    });
  }, [initialDate, initialPeriod, initialProvince, initialRegion, initialScope]);

  const updateQuery = (
    nextDate: string,
    nextPeriod: BeachPeriod,
    nextScope: CatalogScope | null = scope,
  ) => {
    startTransition(() => {
      router.replace(
        buildMapQueryHref({
          pathname,
          searchParams: searchParams.toString(),
          date: nextDate,
          period: nextPeriod,
          scope: nextScope,
        }),
        { scroll: false },
      );
    });
  };

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    updateQuery(nextDate, period, scope);
  };

  const handlePeriodChange = (nextPeriod: BeachPeriod) => {
    setPeriod(nextPeriod);
    updateQuery(date, nextPeriod, scope);
  };

  const handleRegionChange = (value: RegionSelection) => {
    const nextRegion = normalizeRegionCode(value);
    const nextScope = nextRegion === "all"
      ? null
      : { kind: "region", regionCode: nextRegion } as const;
    setRegion(nextRegion);
    setProvince("all");
    setScope(nextScope);
    updateQuery(date, period, nextScope);
  };

  const handleProvinceChange = (value: ProvinceSelection) => {
    const nextProvince = normalizeProvinceCode(value);
    const nextScope = nextProvince === "all"
      ? null
      : { kind: "province", provinceCode: nextProvince } as const;
    setRegion("all");
    setProvince(nextProvince);
    setScope(nextScope);
    updateQuery(date, period, nextScope);
  };

  const handleNearbyChange = (selection: NearbySelection | null) => {
    const nextScope = selection
      ? {
          kind: "nearby" as const,
          latitude: selection.coordinates.latitude,
          longitude: selection.coordinates.longitude,
          radiusKm: Math.min(100, Math.max(1, selection.radiusKm)),
        }
      : null;
    setRegion("all");
    setProvince("all");
    setScope(nextScope);
    updateQuery(date, period, nextScope);
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

          {dataUnavailable ? (
            <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">
                Condizioni non disponibili
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Non riusciamo a caricare i dati della mappa in questo momento. Riprova tra qualche minuto.
              </p>
            </div>
          ) : (
            <NationalMapView
              recommendations={recommendations}
              scope={scope}
              region={region}
              province={province}
              date={date}
              period={period}
              dateOptions={dateOptions}
              onDateChange={handleDateChange}
              onPeriodChange={handlePeriodChange}
              onRegionChange={handleRegionChange}
              onProvinceChange={handleProvinceChange}
              onNearbyChange={handleNearbyChange}
            />
          )}
        </div>
      </main>
      <MobileNav active="mappa" />
    </PageShell>
  );
}
