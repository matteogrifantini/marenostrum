import { Suspense } from "react";
import type { Metadata } from "next";
import { MapExperience } from "../../components/map-experience";
import {
  ForecastDataUnavailableError,
  getBeachRecommendations,
} from "../../data/beach-repository";
import {
  getDateOptions,
  parseDateParam,
  parsePeriodParam,
} from "../../domain/date-selection";
import type { BeachRecommendation } from "../../domain/beach";
import { parseCatalogScope } from "../../domain/catalog-scope";
import { normalizeProvinceCode, normalizeRegionCode, type RegionSelection } from "../../domain/province-filter";
import {
  MAP_PAGE_DESCRIPTION,
  MAP_PAGE_TITLE,
  SITE_SOCIAL_IMAGE,
  SITE_URL,
  SITE_NAME,
} from "../../domain/seo/site-copy";

export const metadata: Metadata = {
  title: MAP_PAGE_TITLE,
  description: MAP_PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/mappa`,
  },
  openGraph: {
    title: `${MAP_PAGE_TITLE} | ${SITE_NAME}`,
    description: MAP_PAGE_DESCRIPTION,
    url: `${SITE_URL}/mappa`,
    type: "website",
    siteName: SITE_NAME,
    locale: "it_IT",
    images: [
      {
        url: SITE_SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: `${MAP_PAGE_TITLE} | ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${MAP_PAGE_TITLE} | ${SITE_NAME}`,
    description: MAP_PAGE_DESCRIPTION,
    images: [SITE_SOCIAL_IMAGE],
  },
};

type MappaSearchParams = {
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

function parseScope(query: MappaSearchParams) {
  const scopeParams = new URLSearchParams();
  for (const key of ["region", "province", "lat", "lng", "radius"] as const) {
    const value = firstParam(query[key]);
    if (value !== undefined) scopeParams.set(key, value);
  }
  return parseCatalogScope(scopeParams);
}

export default async function MappaPage({
  searchParams,
}: {
  searchParams: Promise<MappaSearchParams>;
}) {
  const query = await searchParams;
  const dateOptions = getDateOptions(new Date());
  const initialDate = parseDateParam(firstParam(query.date) ?? null, dateOptions[0].iso);
  const initialPeriod = parsePeriodParam(firstParam(query.period) ?? null);
  const initialScope = parseScope(query);
  const initialRegion: RegionSelection = initialScope?.kind === "region"
    ? normalizeRegionCode(initialScope.regionCode)
    : "all";
  const initialProvince = initialScope?.kind === "province"
    ? normalizeProvinceCode(initialScope.provinceCode)
    : "all";
  let recommendations: BeachRecommendation[];
  let dataUnavailable = false;

  try {
    recommendations = await getBeachRecommendations({
      date: initialDate,
      period: initialPeriod,
      scope: initialScope,
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
          Carico la mappa delle condizioni…
        </main>
      }
    >
      <MapExperience
        initialDate={initialDate}
        initialPeriod={initialPeriod}
        initialScope={initialScope}
        initialRegion={initialRegion}
        initialProvince={initialProvince}
        dateOptions={dateOptions}
        recommendations={recommendations}
        dataUnavailable={dataUnavailable}
      />
    </Suspense>
  );
}
