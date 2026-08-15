import { notFound } from "next/navigation";
import { BeachDetailExperience } from "../../../components/beach-detail-experience";
import {
  DEMO_TODAY,
  demoBeachInputs,
  getDemoRecommendationFor,
} from "../../../data/demo-beaches";
import { normalizeDetailQuery } from "../../../domain/detail-query";

type DetailSearchParams = {
  date?: string | string[];
  period?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function generateStaticParams() {
  return demoBeachInputs.map(({ beach }) => ({ slug: beach.slug }));
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
  const normalized = normalizeDetailQuery(
    firstParam(query.date),
    firstParam(query.period),
    DEMO_TODAY,
  );
  const recommendation = getDemoRecommendationFor(slug, normalized);

  if (!recommendation) notFound();

  return (
    <BeachDetailExperience
      recommendation={recommendation}
      date={normalized.date}
      period={normalized.period}
    />
  );
}
