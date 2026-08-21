import { notFound } from "next/navigation";
import { BeachDetailExperience } from "../../../components/beach-detail-experience";
import {
  emptyBeachDetailContent,
  getDemoBeachDetail,
} from "../../../data/demo-beach-details";
import {
  ForecastDataUnavailableError,
  getBeachForecastBundleBySlug,
} from "../../../data/beach-repository";
import { getDateOptions } from "../../../domain/date-selection";
import { normalizeDetailQuery } from "../../../domain/detail-query";
import { getCommunityReportsForBeach } from "../../../services/community-reports";

type DetailSearchParams = {
  date?: string | string[];
  period?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BeachPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<DetailSearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const dateOptions = getDateOptions(new Date());
  const normalized = normalizeDetailQuery(
    firstParam(query.date),
    firstParam(query.period),
    dateOptions[0].iso,
  );
  let bundle;

  try {
    bundle = await getBeachForecastBundleBySlug({ slug, ...normalized });
  } catch (error) {
    if (!(error instanceof ForecastDataUnavailableError)) {
      throw error;
    }

    return (
      <main className="grid min-h-screen place-items-center bg-[var(--sand)] px-6 text-center">
        <section className="max-w-md rounded-[1.75rem] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
            Condizioni non disponibili
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Non riusciamo a caricare questa spiaggia in questo momento. Riprova tra qualche minuto.
          </p>
        </section>
      </main>
    );
  }

  if (!bundle) notFound();

  const baseDetail = getDemoBeachDetail(slug) ?? emptyBeachDetailContent;
  const communityReports = await getCommunityReportsForBeach(slug);
  const detail = communityReports.length > 0
    ? { ...baseDetail, reports: [...communityReports, ...baseDetail.reports] }
    : baseDetail;

  return (
    <BeachDetailExperience
      beach={bundle.beach}
      recommendation={bundle.selected}
      morningRecommendation={bundle.morning}
      afternoonRecommendation={bundle.afternoon}
      dateOptions={dateOptions}
      detail={detail}
      date={normalized.date}
      period={normalized.period}
      dataUnavailable={bundle.dataUnavailable}
    />
  );
}
