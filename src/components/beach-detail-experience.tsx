"use client";

import { CloudSun, Gauge, Sparkles, ThermometerSun, Waves, Wind } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Beach, BeachPeriod, BeachRecommendation } from "../domain/beach";
import { getBeachAiComment } from "../domain/beach-comment";
import type { BeachDetailContent } from "../domain/beach-detail-content";
import type { DateOption } from "../domain/date-selection";
import { DetailHero } from "./detail-hero";
import { HourlyForecast } from "./hourly-forecast";
import { PageShell } from "./page-shell";
import { BeachLiveSections } from "./beach-live-sections";
import { BeachCommunitySections } from "./beach-community-sections";
import { ForecastAttribution } from "./forecast-attribution";
import { formatAggregateMetric, formatWeatherLabel } from "../lib/forecast-presentation";

type BeachDetailExperienceProps = {
  beach: Beach;
  recommendation?: BeachRecommendation;
  morningRecommendation?: BeachRecommendation;
  afternoonRecommendation?: BeachRecommendation;
  dateOptions: DateOption[];
  detail: BeachDetailContent;
  date: string;
  period: BeachPeriod;
  dataUnavailable?: boolean;
};

type ScoreTone = "excellent" | "good" | "caution" | "poor";

const periods: Array<{ value: BeachPeriod; label: string }> = [
  { value: "all-day", label: "Tutto il giorno" },
  { value: "morning", label: "Mattina" },
  { value: "afternoon", label: "Pomeriggio" },
];

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
  dataUnavailable = false,
}: BeachDetailExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const selectedRecommendation = recommendationForPeriod(
    period,
    recommendation,
    morningRecommendation,
    afternoonRecommendation,
  );

  const replaceSelection = (nextDate: string, nextPeriod: BeachPeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", nextDate);
    params.set("period", nextPeriod);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <PageShell>
      <main className="detail-page min-h-screen pb-24 lg:pb-8">
        <div className="mx-auto max-w-[48rem] px-3 py-3 sm:px-6 sm:py-6">
          <DetailHero beach={beach} detail={detail} date={date} period={period} />

          <div className="relative z-10 mt-3 px-1 pt-3 sm:px-2">
            <div aria-busy={isPending}>
              <DaySelection
                date={date}
                dateOptions={dateOptions}
                onDateChange={(nextDate) => replaceSelection(nextDate, period)}
              />
            </div>

            <AdviceCard recommendation={selectedRecommendation} dataUnavailable={dataUnavailable} />
            <PeriodSelection
              period={period}
              onPeriodChange={(nextPeriod) => replaceSelection(date, nextPeriod)}
            />
            <ConditionsCard
              recommendation={selectedRecommendation}
              period={period}
              morningRecommendation={morningRecommendation}
              afternoonRecommendation={afternoonRecommendation}
              date={date}
              dateOptions={dateOptions}
              dataUnavailable={dataUnavailable}
            />
            <ForecastAttribution />
            <BeachLiveSections beach={beach} detail={detail} />
            <BeachCommunitySections detail={detail} />
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function DaySelection({
  date,
  dateOptions,
  onDateChange,
}: {
  date: string;
  dateOptions: DateOption[];
  onDateChange: (date: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Scegli il giorno"
      className="flex min-w-0 rounded-[0.9rem] bg-white/70 p-1"
    >
      {dateOptions.map((option) => (
        <button
          key={option.iso}
          type="button"
          aria-pressed={date === option.iso}
          onClick={() => onDateChange(option.iso)}
          className={`detail-segment detail-press min-h-11 min-w-0 flex-1 rounded-[0.7rem] px-1 text-center text-xs font-extrabold ${date === option.iso ? "bg-[var(--ink)] text-white shadow-[0_5px_12px_rgba(8,47,61,0.16)]" : "text-[var(--muted)]"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function PeriodSelection({
  period,
  onPeriodChange,
}: {
  period: BeachPeriod;
  onPeriodChange: (period: BeachPeriod) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Scegli la fascia oraria"
      className="mt-2 flex min-w-0 rounded-[0.9rem] bg-white/70 p-1 shadow-[inset_0_0_0_1px_rgba(8,47,61,0.05)]"
    >
      {periods.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={period === option.value}
          onClick={() => onPeriodChange(option.value)}
          className={`detail-segment detail-press min-h-11 min-w-0 flex-1 rounded-[0.7rem] px-1 text-center text-xs font-extrabold ${period === option.value ? "bg-[var(--ink)] text-white shadow-[0_5px_12px_rgba(8,47,61,0.16)]" : "text-[var(--muted)]"}`}
        >
          {option.label}
        </button>
      ))}
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
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-[0.7rem] bg-[var(--surface-muted)] text-[var(--sea-deep)]"><CloudSun size={20} /></span>
          <div><h2 className="text-base font-bold tracking-[-0.025em]">{forecastTitle}</h2><p className="mt-0.5 text-xs text-[var(--muted)]">Cielo · {weatherLabel}</p></div>
        </div>

        {period === "all-day" ? (
          <div role="group" aria-label="Confronto mattina e pomeriggio" className="mt-3 grid grid-cols-2 gap-2 border-b border-[var(--line)] pb-3">
            <DayPart label="Mattina" emoji="☀️" recommendation={morningRecommendation} summary={periodSummary(morningRecommendation, "morning")} />
            <DayPart label="Pomeriggio" emoji="🌬️" recommendation={afternoonRecommendation} summary={periodSummary(afternoonRecommendation, "afternoon")} />
          </div>
        ) : null}

        <div className="mt-2 grid grid-cols-2">
          <ConditionItem icon={<Wind size={17} />} label="Vento" value={windValue} detail={conditions.gustSpeedKmh >= 25 ? "raffiche sostenute" : "intensità regolare"} border="right-bottom" />
          <ConditionItem icon={<Gauge size={17} />} label="Raffiche" value={gustValue} detail="massime previste" border="bottom" />
          <ConditionItem icon={<Waves size={17} />} label="Onde" value={waveValue} detail={conditions.seaState ?? "calmo"} border="right" />
          <ConditionItem icon={<ThermometerSun size={17} />} label="Temp. aria" value={airTemperatureValue} detail={waterValue === "—" ? "acqua non disponibile" : `acqua ${waterValue}`} />
        </div>

        <div className="mt-2 flex justify-end border-t border-[var(--line)] pt-2 text-[0.68rem] font-bold text-[var(--muted)]">
          <span>pioggia {rainChance}%</span>
        </div>

        <div className="border-t border-[var(--line)] pt-1">
          <HourlyForecast hourly={conditions.hourly} />
        </div>
      </section>
    </>
  );
}

function DayPart({ label, emoji, recommendation, summary }: { label: string; emoji: string; recommendation?: BeachRecommendation; summary: string }) {
  return (
    <div className="rounded-[0.9rem] bg-[var(--surface-muted)]/70 p-3">
      <div className="flex items-center justify-between text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]"><span>{label}</span><span aria-hidden="true" className="emoji-readable-mobile">{emoji}</span></div>
      <strong className="mt-2 block text-3xl leading-none tracking-[-0.05em]">{recommendation ? displayScore(recommendation.score) : "—"}</strong>
      <p className="mt-2 text-[0.68rem] leading-4 text-[var(--muted)]">{summary}</p>
    </div>
  );
}

function ConditionItem({ icon, label, value, detail, border = "" }: { icon: React.ReactNode; label: string; value: string; detail: string; border?: "right-bottom" | "bottom" | "right" | "" }) {
  const borderClasses = border === "right-bottom" ? "border-b border-r" : border === "bottom" ? "border-b" : border === "right" ? "border-r" : "";
  return (
    <div aria-label={`${label}: ${value}`} className={`grid min-w-0 grid-cols-[1.8rem_1fr] items-center gap-2 border-[var(--line)] px-2 py-4 ${borderClasses}`}>
      <span aria-hidden="true" className="grid size-7 place-items-center rounded-[0.55rem] bg-[var(--surface-muted)] text-[var(--sea-deep)]">{icon}</span>
      <div className="min-w-0"><span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</span><strong className="mt-1 block truncate text-sm">{value}</strong><span className="mt-0.5 block text-[0.65rem] text-[var(--muted)]">{detail}</span></div>
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
