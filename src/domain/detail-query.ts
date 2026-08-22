import type { BeachPeriod } from "./beach";
import { parseDateParam, parsePeriodParam } from "./date-selection";

export type DetailOrigin = "home" | "detail";

export function parseDetailOrigin(value: string | null | undefined): DetailOrigin {
  return value === "home" ? "home" : "detail";
}

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
