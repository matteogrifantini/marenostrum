import { notFound } from "next/navigation";
import { BeachDetailExperience } from "../../../components/beach-detail-experience";
import {
  emptyBeachDetailContent,
  getDemoBeachDetail,
} from "../../../data/demo-beach-details";
import { getBeachForecastBundleBySlug } from "../../../data/beach-repository";
import { getDateOptions } from "../../../domain/date-selection";
import { normalizeDetailQuery } from "../../../domain/detail-query";

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
  const bundle = await getBeachForecastBundleBySlug({ slug, ...normalized });

  if (!bundle) notFound();

  const detail = getDemoBeachDetail(slug) ?? emptyBeachDetailContent;

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
      dataUnavailable={!bundle.selected}
    />
  );
}
