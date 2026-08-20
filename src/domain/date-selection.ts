import type { BeachPeriod } from "./beach";

export type DateOption = {
  iso: string;
  label: string;
  relativeLabel: string;
};

export const BEACH_PERIODS: BeachPeriod[] = [
  "all-day",
  "morning",
  "afternoon",
];

const PERIOD_LABELS: Record<BeachPeriod, string> = {
  "all-day": "Tutto il giorno",
  morning: "Mattina",
  afternoon: "Pomeriggio",
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_TIME_ZONE = "Europe/Rome";
const ITALIAN_DAY_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  weekday: "short",
});
const UTC_ITALIAN_DAY_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  timeZone: "UTC",
  weekday: "short",
});

function calendarDateInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return new Date(
    Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day), 12),
  );
}

function toIsoDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseCalendarIsoDate(value: string | null | undefined) {
  if (!value || !ISO_DATE_PATTERN.test(value)) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return undefined;
  }

  return parsed;
}

function formatRelativeLabel(date: Date, timeZone?: string) {
  const formatter = timeZone ? UTC_ITALIAN_DAY_FORMATTER : ITALIAN_DAY_FORMATTER;
  return formatter.format(date).replace(/\.$/, "");
}

export function getDateOptions(
  baseDate: Date,
  timeZone = DEFAULT_TIME_ZONE,
): DateOption[] {
  const start = calendarDateInTimeZone(baseDate, timeZone);

  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);

    return {
      iso: toIsoDate(date),
      label:
        index === 0
          ? "Oggi"
          : index === 1
            ? "Domani"
            : formatRelativeLabel(date, timeZone),
      relativeLabel: formatRelativeLabel(date, timeZone),
    };
  });
}

export function parseDateParam(value: string | null, fallback: string) {
  const fallbackDate = parseCalendarIsoDate(fallback);
  const candidateDate = parseCalendarIsoDate(value);

  if (!fallbackDate || !candidateDate) return fallback;

  const validDates = new Set(
    getDateOptions(fallbackDate).map((option) => option.iso),
  );
  const candidate = toIsoDate(candidateDate);

  return validDates.has(candidate) ? candidate : fallback;
}

export function parsePeriodParam(value: string | null): BeachPeriod {
  return value && BEACH_PERIODS.includes(value as BeachPeriod)
    ? (value as BeachPeriod)
    : "all-day";
}

export function getPeriodLabel(period: BeachPeriod) {
  return PERIOD_LABELS[period];
}
