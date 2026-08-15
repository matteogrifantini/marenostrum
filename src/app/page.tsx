import { Suspense } from "react";
import { HomeExperience } from "../components/home-experience";
import { DEMO_TODAY } from "../data/demo-beaches";
import { parseDateParam, parsePeriodParam } from "../domain/date-selection";

type HomeSearchParams = {
  date?: string | string[];
  period?: string | string[];
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
  const initialDate = parseDateParam(firstParam(query.date) ?? null, DEMO_TODAY);
  const initialPeriod = parsePeriodParam(firstParam(query.period) ?? null);

  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[var(--sand)] px-6 text-center text-[var(--muted)]">
          Carico le condizioni del mare…
        </main>
      }
    >
      <HomeExperience initialDate={initialDate} initialPeriod={initialPeriod} />
    </Suspense>
  );
}
