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
import { normalizeProvinceCode } from "../../domain/province-filter";
import {
  MAP_PAGE_DESCRIPTION,
  MAP_PAGE_TITLE,
  SITE_NAME,
} from "../../domain/seo/site-copy";

export const metadata: Metadata = {
  title: MAP_PAGE_TITLE,
  description: MAP_PAGE_DESCRIPTION,
  alternates: {
    canonical: "https://marenostrum.app/mappa",
  },
  openGraph: {
    title: `${MAP_PAGE_TITLE} | ${SITE_NAME}`,
    description: MAP_PAGE_DESCRIPTION,
    url: "https://marenostrum.app/mappa",
    type: "website",
    siteName: SITE_NAME,
    locale: "it_IT",
  },
};

type MappaSearchParams = {
  date?: string | string[];
  period?: string | string[];
  province?: string | string[];
};

export const revalidate = 300;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
  const initialProvince = normalizeProvinceCode(firstParam(query.province));
  let recommendations: BeachRecommendation[];
  let dataUnavailable = false;

  try {
    recommendations = await getBeachRecommendations({
      date: initialDate,
      period: initialPeriod,
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
        initialProvince={initialProvince}
        dateOptions={dateOptions}
        recommendations={recommendations}
        dataUnavailable={dataUnavailable}
      />
    </Suspense>
  );
}
