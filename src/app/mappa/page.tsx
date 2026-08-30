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

export const metadata: Metadata = {
  title: "Mappa del Mare e del Vento in Sicilia",
  description:
    "Mappa interattiva della Sicilia con rating delle condizioni, parcheggi, lidi e servizi utili per il mare.",
  alternates: {
    canonical: "https://marenostrum.app/mappa",
  },
  openGraph: {
    title: "Mappa del Mare e del Vento in Sicilia — Mare Nostrum",
    description:
      "Rating delle spiagge e punti utili per il mare su una vera cartografia della Sicilia.",
    url: "https://marenostrum.app/mappa",
    type: "website",
    siteName: "Mare Nostrum",
    locale: "it_IT",
  },
};

type MappaSearchParams = {
  date?: string | string[];
  period?: string | string[];
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
        dateOptions={dateOptions}
        recommendations={recommendations}
        dataUnavailable={dataUnavailable}
      />
    </Suspense>
  );
}
