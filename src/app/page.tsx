import { Suspense } from "react";
import { HomeExperience } from "../components/home-experience";
import {
  ForecastDataUnavailableError,
  getBeachRecommendations,
} from "../data/beach-repository";
import {
  getDateOptions,
  parseDateParam,
  parsePeriodParam,
} from "../domain/date-selection";
import type { BeachRecommendation } from "../domain/beach";
import { parseCatalogScope } from "../domain/catalog-scope";
import {
  normalizeProvinceCode,
  normalizeRegionCode,
  type ProvinceSelection,
  type RegionSelection,
} from "../domain/province-filter";

type HomeSearchParams = {
  date?: string | string[];
  period?: string | string[];
  region?: string | string[];
  province?: string | string[];
  lat?: string | string[];
  lng?: string | string[];
  radius?: string | string[];
};

export const revalidate = 300;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseScope(query: HomeSearchParams) {
  const scopeParams = new URLSearchParams();
  for (const key of ["region", "province", "lat", "lng", "radius"] as const) {
    const value = firstParam(query[key]);
    if (value !== undefined) scopeParams.set(key, value);
  }
  return parseCatalogScope(scopeParams);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const query = await searchParams;
  const dateOptions = getDateOptions(new Date());
  const initialDate = parseDateParam(firstParam(query.date) ?? null, dateOptions[0].iso);
  const initialPeriod = parsePeriodParam(firstParam(query.period) ?? null);
  const initialScope = parseScope(query);
  const initialRegion: RegionSelection = initialScope?.kind === "region"
    ? normalizeRegionCode(initialScope.regionCode)
    : "all";
  const initialProvince: ProvinceSelection = initialScope?.kind === "province"
    ? normalizeProvinceCode(initialScope.provinceCode)
    : "all";
  let recommendations: BeachRecommendation[];
  let dataUnavailable = false;

  try {
    recommendations = await getBeachRecommendations({
      date: initialDate,
      period: initialPeriod,
      scope: initialScope,
      nationalPreview: initialScope === null,
    });
  } catch (error) {
    if (!(error instanceof ForecastDataUnavailableError)) {
      throw error;
    }

    recommendations = [];
    dataUnavailable = true;
  }

  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[var(--sand)] px-6 text-center text-[var(--muted)]">
          Carico le condizioni del mare…
        </main>
      }
    >
      <HomeExperience
        initialDate={initialDate}
        initialPeriod={initialPeriod}
        initialScope={initialScope}
        initialRegion={initialRegion}
        initialProvince={initialProvince}
        dateOptions={dateOptions}
        recommendations={recommendations}
        nationalPreview={initialScope === null}
        dataUnavailable={dataUnavailable}
      />
    </Suspense>
  );
}
