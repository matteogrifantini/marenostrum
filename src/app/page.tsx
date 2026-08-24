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
import { normalizeProvinceCode, type ProvinceSelection } from "../domain/province-filter";

type HomeSearchParams = {
  date?: string | string[];
  period?: string | string[];
  province?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
  const initialProvince: ProvinceSelection = normalizeProvinceCode(firstParam(query.province));
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
          Carico le condizioni del mare…
        </main>
      }
    >
      <HomeExperience
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
