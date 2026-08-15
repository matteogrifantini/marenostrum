import type { BeachPeriod } from "./beach";
import { parseDateParam, parsePeriodParam } from "./date-selection";

export function normalizeDetailQuery(
  dateParam: string | null | undefined,
  periodParam: string | null | undefined,
  fallbackDate: string,
) {
  return {
    date: parseDateParam(dateParam ?? null, fallbackDate),
    period: parsePeriodParam(periodParam ?? null),
  };
}

export function buildNextDayHref(
  slug: string,
  date: string,
  period: BeachPeriod,
) {
  return `/spiagge/${slug}?date=${encodeURIComponent(date)}&period=${period}`;
}
