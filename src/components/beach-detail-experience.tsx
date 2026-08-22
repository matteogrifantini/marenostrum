"use client";

import { CloudSun, Gauge, Sparkles, ThermometerSun, Waves, Wind } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { Beach, BeachPeriod, BeachRecommendation } from "../domain/beach";
import { getBeachAiComment } from "../domain/beach-comment";
import type { BeachDetailContent } from "../domain/beach-detail-content";
import type { DetailOrigin } from "../domain/detail-query";
import type { DateOption } from "../domain/date-selection";
import { DetailHero } from "./detail-hero";
import { DayPicker } from "./day-picker";
import { HourlyForecast } from "./hourly-forecast";
import { PageShell } from "./page-shell";
import { BeachLiveSections } from "./beach-live-sections";
import { BeachCommunitySections } from "./beach-community-sections";
import { ForecastAttribution } from "./forecast-attribution";
import {
  formatAggregateMetric,
  formatWeatherLabel,
  getWeatherEmoji,
} from "../lib/forecast-presentation";

type BeachDetailExperienceProps = {
  beach: Beach;
  recommendation?: BeachRecommendation;
  morningRecommendation?: BeachRecommendation;
  afternoonRecommendation?: BeachRecommendation;
  dateOptions: DateOption[];
  detail: BeachDetailContent;
  date: string;
  period: BeachPeriod;
  origin: DetailOrigin;
  dataUnavailable?: boolean;
};

type ScoreTone = "excellent" | "good" | "caution" | "poor";

const directionNames = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SO",
  "O",
  "NO",
];

const periods: Array<{ value: BeachPeriod; label: string }> = [
  { value: "all-day", label: "Tutto il giorno" },
  { value: "morning", label: "Mattina" },
  { value: "afternoon", label: "Pomeriggio" },
];

function directionName(degrees: number) {
  return directionNames[Math.round((degrees % 360) / 45) % directionNames.length];
}

function displayScore(score: number) {
  return (Math.max(0, Math.min(100, score)) / 10).toFixed(1);
}

function scoreTone(score: number): ScoreTone {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "caution";
  return "poor";
}

const scoreSurfaceClasses: Record<ScoreTone, string> = {
  excellent: "bg-[var(--score-excellent-soft)]",
  good: "bg-[var(--score-good-soft)]",
  caution: "bg-[var(--score-caution-soft)]",
  poor: "bg-[var(--score-poor-soft)]",
};

const scoreBadgeClasses: Record<ScoreTone, string> = {
  excellent: "bg-[var(--score-excellent)] text-white",
  good: "bg-[var(--score-good)] text-white",
  caution: "bg-[var(--score-caution)] text-[var(--ink)]",
  poor: "bg-[var(--score-poor)] text-white",
};

function weatherAccentClasses(weather: BeachRecommendation["conditions"]["weather"] | undefined) {
  switch (weather) {
    case "sereno":
    case "poco nuvoloso":
      return "bg-[var(--sun-soft)] text-[var(--sun-dark)]";
    case "pioggia":
      return "bg-[var(--sea-soft)] text-[var(--sea-deep)]";
    case "nuvoloso":
      return "bg-[var(--surface-muted)] text-[var(--ink-soft)]";
    default:
      return "bg-[var(--surface-muted)] text-[var(--ink)]";
  }
}

type ConditionAccent = "sea" | "sun" | "warm";

const conditionIconClasses: Record<ConditionAccent, string> = {
  sea: "bg-[var(--sea-soft)] text-[var(--sea-deep)]",
  sun: "bg-[var(--sun-soft)] text-[var(--sun-dark)]",
  warm: "bg-[var(--score-poor-soft)] text-[var(--coral)]",
};

function scoreHeadline(score: number) {
  if (score >= 80) return "Ottima scelta";
  if (score >= 70) return "Condizioni accettabili";
  if (score >= 55) return "Da valutare con attenzione";
  return "Meglio scegliere un’altra spiaggia";
}

function periodSummary(recommendation: BeachRecommendation | undefined, period: "morning" | "afternoon") {
  if (!recommendation) return "Dati non disponibili";

  if (period === "morning") {
    return recommendation.conditions.windSpeedKmh <= 12
      ? "Vento leggero fino alle 12"
      : `Vento ${formatAggregateMetric(recommendation.conditions.windSpeedKmh)} km/h`;
  }

  return recommendation.conditions.gustSpeedKmh >= 25
    ? `Raffiche fino a ${formatAggregateMetric(recommendation.conditions.gustSpeedKmh)} km/h`
    : `Vento ${formatAggregateMetric(recommendation.conditions.windSpeedKmh)} km/h`;
}

function recommendationForPeriod(
  period: BeachPeriod,
  allDayRecommendation: BeachRecommendation | undefined,
  morningRecommendation: BeachRecommendation | undefined,
  afternoonRecommendation: BeachRecommendation | undefined,
) {
  if (period === "morning") return morningRecommendation ?? allDayRecommendation;
  if (period === "afternoon") return afternoonRecommendation ?? allDayRecommendation;
  return allDayRecommendation;
}

export function BeachDetailExperience({
  beach,
  recommendation,
  morningRecommendation,
  afternoonRecommendation,
  dateOptions,
  detail,
  date,
  period,
  origin,
  dataUnavailable = false,
}: BeachDetailExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [navigationOrigin, setNavigationOrigin] = useState<DetailOrigin>(origin);
  const [selection, setSelection] = useState<{ date: string; period: BeachPeriod }>({ date, period });
  const selectedRecommendation = recommendationForPeriod(
    selection.period,
    recommendation,
    morningRecommendation,
    afternoonRecommendation,
  );

  const replaceSelection = (
    nextDate: string,
    nextPeriod: BeachPeriod,
    nextOrigin: DetailOrigin = navigationOrigin,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", nextDate);
    params.set("period", nextPeriod);
    params.set("source", nextOrigin);
    setNavigationOrigin(nextOrigin);
    setSelection({ date: nextDate, period: nextPeriod });
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <PageShell>
      <main className="detail-page min-h-screen pb-24 lg:pb-8">
        <div className="mx-auto max-w-[1440px] px-3 py-3 sm:px-6 sm:py-6">
          <DetailHero
            beach={beach}
            detail={detail}
            homeDate={navigationOrigin === "home" ? date : undefined}
          />

          <div className="relative z-10 mx-auto mt-3 w-full max-w-[48rem] px-1 pt-3 sm:px-2">
            <div aria-busy={isPending} className="space-y-2">
              <DayPicker
                options={dateOptions}
                value={selection.date}
                onChange={(nextDate) => replaceSelection(nextDate, selection.period, "detail")}
              />
            </div>

            <AdviceCard recommendation={selectedRecommendation} dataUnavailable={dataUnavailable} />
            <PeriodSelection
              value={selection.period}
              onChange={(nextPeriod) => replaceSelection(selection.date, nextPeriod)}
            />
            <ConditionsCard
              recommendation={selectedRecommendation}
              period={selection.period}
              morningRecommendation={morningRecommendation}
              afternoonRecommendation={afternoonRecommendation}
              date={date}
              dateOptions={dateOptions}
              dataUnavailable={dataUnavailable}
            />
            <BeachLiveSections beach={beach} detail={detail} />
            <BeachCommunitySections detail={detail} />
            <ForecastAttribution
              includeParkingSource={detail.parkings.some((parking) => parking.sourceUrl?.includes("openstreetmap.org"))}
            />
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function PeriodSelection({
  value,
  onChange,
}: {
  value: BeachPeriod;
  onChange: (value: BeachPeriod) => void;
}) {
  return (
    <div
      aria-label="Scegli la fascia oraria"
      className="period-picker mt-3 grid min-w-0 grid-cols-3 gap-1 rounded-full bg-[var(--control-surface)] p-1"
      role="group"
    >
      {periods.map((period) => {
        const selected = period.value === value;

        return (
          <button
            key={period.value}
            type="button"
            aria-label={period.label}
            aria-pressed={selected}
            onClick={() => onChange(period.value)}
            className={[
              "min-h-11 min-w-0 rounded-full px-2 py-2 text-center text-sm font-bold transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
              selected
                ? "bg-[var(--ink)] text-white shadow-[0_8px_20px_rgba(20,44,57,0.16)]"
                : "bg-transparent text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}

function AdviceCard({
  recommendation,
  dataUnavailable,
}: {
  recommendation?: BeachRecommendation;
  dataUnavailable: boolean;
}) {
  if (!recommendation || dataUnavailable) {
    return (
      <article role="note" aria-labelledby="mare-nostrum-advice-title" className="detail-enter mt-3 rounded-[1.3rem] border border-[rgba(8,47,61,0.065)] bg-[linear-gradient(145deg,#e1dccf,#d9d3c6)] p-4 shadow-[0_9px_24px_rgba(8,47,61,0.075)] sm:p-5">
        <p id="mare-nostrum-advice-title" className="text-sm font-medium leading-6 text-[var(--ink-soft)]">Condizioni temporaneamente non disponibili. Riprova tra qualche minuto.</p>
      </article>
    );
  }

  const comment = getBeachAiComment(recommendation);
  const tone = scoreTone(recommendation.score);

  return (
    <article
      role="note"
      aria-labelledby="mare-nostrum-advice-title"
      data-score-tone={tone}
      className={`detail-enter mt-2 rounded-[1.3rem] border border-[rgba(8,47,61,0.065)] p-3 shadow-[0_9px_24px_rgba(8,47,61,0.075)] sm:p-4 ${scoreSurfaceClasses[tone]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p id="mare-nostrum-advice-title" className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-[0.65rem] bg-white/45 text-base shadow-[inset_0_0_0_1px_rgba(8,47,61,0.04)]"><Sparkles size={16} /></span>
            Il consiglio di Mare Nostrum
          </p>
          <strong className="mt-2 block text-xl tracking-[-0.035em] text-[var(--ink)]">{scoreHeadline(recommendation.score)}</strong>
        </div>
        <span className={`grid size-14 shrink-0 place-items-center rounded-full text-xl font-black shadow-[0_7px_16px_rgba(20,44,57,0.14)] ${scoreBadgeClasses[tone]}`}>
          {displayScore(recommendation.score)}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-6 text-[var(--ink-soft)]">{comment.text}</p>
    </article>
  );
}

function ConditionsCard({
  recommendation,
  period,
  morningRecommendation,
  afternoonRecommendation,
  date,
  dateOptions,
  dataUnavailable,
}: {
  recommendation?: BeachRecommendation;
  period: BeachPeriod;
  morningRecommendation?: BeachRecommendation;
  afternoonRecommendation?: BeachRecommendation;
  date: string;
  dateOptions: DateOption[];
  dataUnavailable: boolean;
}) {
  if (!recommendation || dataUnavailable) {
    return (
      <>
        <SectionHeading title="Condizioni" />
        <section aria-label="Condizioni meteo" className="detail-enter rounded-[1.3rem] border border-[rgba(8,47,61,0.055)] bg-[var(--surface)] p-3 shadow-[0_8px_24px_rgba(8,47,61,0.072)] sm:p-4">
          <p className="text-sm font-medium leading-6 text-[var(--ink-soft)]">Condizioni temporaneamente non disponibili. Riprova tra qualche minuto.</p>
        </section>
      </>
    );
  }

  const { conditions } = recommendation;
  const rainChance = formatAggregateMetric(conditions.precipitationProbabilityPercent ?? 0);
  const selectedDateLabel = dateOptions.find((option) => option.iso === date)?.label ?? date;
  const forecastTitle = `Previsioni ${selectedDateLabel.toLocaleLowerCase("it-IT")}`;
  const windValue = `${directionName(conditions.windDirectionDegrees)} · ${formatAggregateMetric(conditions.windSpeedKmh)} km/h`;
  const gustValue = `${formatAggregateMetric(conditions.gustSpeedKmh)} km/h`;
  const waveValue = `${formatAggregateMetric(conditions.waveHeightMeters)} m`;
  const airTemperatureValue = `${formatAggregateMetric(conditions.temperatureCelsius)}°`;
  const waterValue = conditions.waterTemperatureCelsius == null
    ? "—"
    : `${formatAggregateMetric(conditions.waterTemperatureCelsius)}°`;
  const weatherLabel = formatWeatherLabel(conditions.weather);

  return (
    <>
      <SectionHeading
        title="Condizioni"
        stale={recommendation.confidence === "bassa"}
      />
      <section aria-label="Condizioni meteo" className="detail-enter rounded-[1.3rem] border border-[rgba(8,47,61,0.055)] bg-[var(--surface)] p-3 shadow-[0_8px_24px_rgba(8,47,61,0.072)] sm:p-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className={`grid size-9 place-items-center rounded-[0.7rem] ${weatherAccentClasses(conditions.weather)}`}><CloudSun size={20} /></span>
          <div><h2 className="text-base font-bold tracking-[-0.025em]">{forecastTitle}</h2><p className="mt-0.5 text-xs font-medium text-[var(--ink)]">Cielo · {weatherLabel}</p></div>
        </div>

        {period === "all-day" ? (
          <div role="group" aria-label="Confronto mattina e pomeriggio" className="mt-3 grid grid-cols-2 gap-2 border-b border-[var(--line)] pb-3">
            <DayPart label="Mattina" recommendation={morningRecommendation} summary={periodSummary(morningRecommendation, "morning")} />
            <DayPart label="Pomeriggio" recommendation={afternoonRecommendation} summary={periodSummary(afternoonRecommendation, "afternoon")} />
          </div>
        ) : null}

        <div className="mt-2 grid grid-cols-2">
          <ConditionItem accent="sea" icon={<Wind size={17} />} label="Vento" value={windValue} detail={conditions.gustSpeedKmh >= 25 ? "raffiche sostenute" : "intensità regolare"} border="right-bottom" />
          <ConditionItem accent="sun" icon={<Gauge size={17} />} label="Raffiche" value={gustValue} detail="massime previste" border="bottom" />
          <ConditionItem accent="sea" icon={<Waves size={17} />} label="Onde" value={waveValue} detail={conditions.seaState ?? "calmo"} border="right" />
          <ConditionItem accent="warm" icon={<ThermometerSun size={17} />} label="Temp. aria" value={airTemperatureValue} detail={waterValue === "—" ? "acqua non disponibile" : `acqua ${waterValue}`} />
        </div>

        <div className="mt-2 flex justify-end border-t border-[var(--line)] pt-2 text-[0.68rem] font-bold text-[var(--ink)]">
          <span>pioggia {rainChance}%</span>
        </div>

        <div className="border-t border-[var(--line)] pt-1">
          <HourlyForecast hourly={conditions.hourly} />
        </div>
      </section>
    </>
  );
}

function DayPart({ label, recommendation, summary }: { label: string; recommendation?: BeachRecommendation; summary: string }) {
  const weather = recommendation?.conditions.weather;
  const emoji = getWeatherEmoji(weather);
  const weatherLabel = weather ? formatWeatherLabel(weather) : "Non disponibile";
  const surfaceClass = recommendation
    ? scoreSurfaceClasses[scoreTone(recommendation.score)]
    : "bg-[var(--surface-muted)]/70";
  const emojiClass = weatherAccentClasses(weather);

  return (
    <div className={`rounded-[0.9rem] p-3 ${surfaceClass}`}>
      <div className="flex items-center justify-between text-[0.65rem] font-extrabold uppercase tracking-[0.08em]"><span className="text-[var(--ink)]">{label}</span><span role="img" aria-label={`Meteo ${weatherLabel}`} className={`grid size-10 place-items-center rounded-[0.75rem] text-2xl leading-none shadow-[0_4px_10px_rgba(20,44,57,0.1)] ${emojiClass}`}>{emoji}</span></div>
      <strong className="mt-2 block text-3xl leading-none tracking-[-0.05em]">{recommendation ? displayScore(recommendation.score) : "—"}</strong>
      <p className="mt-2 text-[0.68rem] leading-4 text-[var(--ink-soft)]">{summary}</p>
    </div>
  );
}

function ConditionItem({ icon, label, value, detail, accent, border = "" }: { icon: React.ReactNode; label: string; value: string; detail: string; accent: ConditionAccent; border?: "right-bottom" | "bottom" | "right" | "" }) {
  const borderClasses = border === "right-bottom" ? "border-b border-r" : border === "bottom" ? "border-b" : border === "right" ? "border-r" : "";
  return (
    <div aria-label={`${label}: ${value}`} className={`grid min-w-0 grid-cols-[1.8rem_1fr] items-center gap-2 border-[var(--line)] px-2 py-4 ${borderClasses}`}>
      <span aria-hidden="true" className={`grid size-7 place-items-center rounded-[0.55rem] ${conditionIconClasses[accent]}`}>{icon}</span>
      <div className="min-w-0"><span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-[var(--ink)]">{label}</span><strong className="mt-1 block truncate text-sm text-[var(--ink)]">{value}</strong><span className="mt-0.5 block text-[0.65rem] text-[var(--ink-soft)]">{detail}</span></div>
    </div>
  );
}

function SectionHeading({ title, stale = false }: { title: string; stale?: boolean }) {
  return (
    <div className="mx-1 mb-2 mt-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2>
      {stale ? <span className="text-right text-xs font-bold text-[var(--sea)]">Dati non recenti: verifica le condizioni prima di partire.</span> : null}
    </div>
  );
}
