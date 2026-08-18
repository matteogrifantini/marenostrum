"use client";

import { CloudSun, Droplets, Sparkles, Waves, Wind } from "lucide-react";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import { getBeachAiComment } from "../domain/beach-comment";
import { DEMO_DATE_OPTIONS, getDemoRecommendationFor } from "../data/demo-beaches";
import { getDemoBeachDetail } from "../data/demo-beach-details";
import { DetailHero } from "./detail-hero";
import { HourlyForecast } from "./hourly-forecast";
import { PageShell } from "./page-shell";
import { BeachLiveSections } from "./beach-live-sections";
import { BeachCommunitySections } from "./beach-community-sections";

type BeachDetailExperienceProps = {
  recommendation: BeachRecommendation;
  date: string;
  period: BeachPeriod;
};

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
      : `Vento ${recommendation.conditions.windSpeedKmh} km/h`;
  }

  return recommendation.conditions.gustSpeedKmh >= 25
    ? `Raffiche fino a ${recommendation.conditions.gustSpeedKmh} km/h`
    : `Vento ${recommendation.conditions.windSpeedKmh} km/h`;
}

export function BeachDetailExperience({ recommendation, date, period }: BeachDetailExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detail = getDemoBeachDetail(recommendation.beach.slug);
  const periodRecommendations = useMemo(
    () => ({
      morning: getDemoRecommendationFor(recommendation.beach.slug, { date, period: "morning" }),
      afternoon: getDemoRecommendationFor(recommendation.beach.slug, { date, period: "afternoon" }),
    }),
    [date, recommendation.beach.slug],
  );

  if (!detail) return null;

  const replaceSelection = (nextDate: string, nextPeriod: BeachPeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", nextDate);
    params.set("period", nextPeriod);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <PageShell>
      <main className="min-h-screen pb-16">
        <div className="mx-auto max-w-[48rem] px-3 py-3 sm:px-6 sm:py-6">
          <DetailHero recommendation={recommendation} detail={detail} date={date} period={period} />

          <div className="relative z-10 -mt-3 rounded-t-[1.65rem] bg-[var(--sand)] px-1 pt-3 sm:px-2">
            <SelectionControls
              date={date}
              period={period}
              onDateChange={(nextDate) => replaceSelection(nextDate, period)}
              onPeriodChange={(nextPeriod) => replaceSelection(date, nextPeriod)}
            />

            <AdviceCard recommendation={recommendation} />
            <ConditionsCard
              recommendation={recommendation}
              period={period}
              morningRecommendation={periodRecommendations.morning}
              afternoonRecommendation={periodRecommendations.afternoon}
            />
            <BeachLiveSections beach={recommendation.beach} detail={detail} />
            <BeachCommunitySections detail={detail} />
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function SelectionControls({
  date,
  period,
  onDateChange,
  onPeriodChange,
}: {
  date: string;
  period: BeachPeriod;
  onDateChange: (date: string) => void;
  onPeriodChange: (period: BeachPeriod) => void;
}) {
  const dayOptions = DEMO_DATE_OPTIONS.slice(0, 2);

  return (
    <div className="grid grid-cols-[0.78fr_1.35fr] gap-2" aria-label="Data e fascia oraria">
      <div className="flex min-w-0 rounded-[0.9rem] bg-white/70 p-1 shadow-[inset_0_0_0_1px_rgba(8,47,61,0.05)]">
        {dayOptions.map((option) => (
          <button
            key={option.iso}
            type="button"
            aria-pressed={date === option.iso}
            onClick={() => onDateChange(option.iso)}
            className={`detail-segment detail-press min-h-11 min-w-0 flex-1 rounded-[0.7rem] px-1 text-[0.68rem] font-extrabold ${date === option.iso ? "bg-[var(--ink)] text-white shadow-[0_5px_12px_rgba(8,47,61,0.16)]" : "text-[var(--muted)]"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="flex min-w-0 rounded-[0.9rem] bg-white/70 p-1 shadow-[inset_0_0_0_1px_rgba(8,47,61,0.05)]">
        {periods.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={period === option.value}
            onClick={() => onPeriodChange(option.value)}
            className={`detail-segment detail-press min-h-11 min-w-0 flex-1 rounded-[0.7rem] px-1 text-[0.6rem] font-extrabold sm:text-xs ${period === option.value ? "bg-[var(--ink)] text-white shadow-[0_5px_12px_rgba(8,47,61,0.16)]" : "text-[var(--muted)]"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AdviceCard({ recommendation }: { recommendation: BeachRecommendation }) {
  const comment = getBeachAiComment(recommendation);

  return (
    <article
      role="note"
      aria-labelledby="mare-nostrum-advice-title"
      className="detail-enter mt-3 rounded-[1.3rem] border border-[rgba(8,47,61,0.065)] bg-[linear-gradient(145deg,#e1dccf,#d9d3c6)] p-4 shadow-[0_9px_24px_rgba(8,47,61,0.075)] sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p id="mare-nostrum-advice-title" className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-[0.65rem] bg-white/45 text-base shadow-[inset_0_0_0_1px_rgba(8,47,61,0.04)]"><Sparkles size={16} /></span>
            Il consiglio di Mare Nostrum
          </p>
          <strong className="mt-2 block text-xl tracking-[-0.035em] text-[var(--ink)]">{scoreHeadline(recommendation.score)}</strong>
        </div>
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--sun)] text-xl font-black text-[#5c4009] shadow-[0_7px_16px_rgba(134,92,9,0.15)]">
          {displayScore(recommendation.score)}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-[var(--ink-soft)]">{comment.text}</p>
    </article>
  );
}

function ConditionsCard({
  recommendation,
  period,
  morningRecommendation,
  afternoonRecommendation,
}: {
  recommendation: BeachRecommendation;
  period: BeachPeriod;
  morningRecommendation?: BeachRecommendation;
  afternoonRecommendation?: BeachRecommendation;
}) {
  const { conditions } = recommendation;
  const rainChance = conditions.weather === "pioggia" ? 65 : conditions.weather === "nuvoloso" ? 25 : 5;

  return (
    <>
      <SectionHeading title="Condizioni" meta="ore 11:20" />
      <section aria-label="Condizioni meteo" className="detail-enter rounded-[1.3rem] border border-[rgba(8,47,61,0.055)] bg-[var(--surface)] p-4 shadow-[0_8px_24px_rgba(8,47,61,0.072)] sm:p-5">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-[0.7rem] bg-[var(--surface-muted)] text-lg">🌊</span>
          <div><h2 className="text-base font-bold tracking-[-0.025em]">Oggi al mare</h2><p className="mt-0.5 text-xs text-[var(--muted)]">Previsioni per la selezione attiva</p></div>
        </div>

        {period === "all-day" ? (
          <div role="group" aria-label="Confronto mattina e pomeriggio" className="mt-4 grid grid-cols-2 gap-2 border-b border-[var(--line)] pb-4">
            <DayPart label="Mattina" emoji="☀️" recommendation={morningRecommendation} summary={periodSummary(morningRecommendation, "morning")} />
            <DayPart label="Pomeriggio" emoji="🌬️" recommendation={afternoonRecommendation} summary={periodSummary(afternoonRecommendation, "afternoon")} />
          </div>
        ) : null}

        <div className="mt-2 grid grid-cols-2">
          <ConditionItem icon={<Wind size={17} />} label="Vento" value={`${directionName(conditions.windDirectionDegrees)} · ${conditions.windSpeedKmh} km/h`} detail={conditions.gustSpeedKmh >= 25 ? "raffiche sostenute" : "intensità regolare"} border="right-bottom" />
          <ConditionItem icon={<Waves size={17} />} label="Onde" value={`${conditions.waveHeightMeters.toFixed(1)} m`} detail={conditions.seaState ?? "calmo"} border="bottom" />
          <ConditionItem icon={<Droplets size={17} />} label="Acqua" value={conditions.waterTemperatureCelsius ? `${conditions.waterTemperatureCelsius}°` : "—"} detail="stima superficiale" border="right" />
          <ConditionItem icon={<CloudSun size={17} />} label="Meteo" value={conditions.weather} detail={`pioggia ${rainChance}%`} />
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
      <div className="flex items-center justify-between text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]"><span>{label}</span><span aria-hidden="true">{emoji}</span></div>
      <strong className="mt-2 block text-3xl leading-none tracking-[-0.05em]">{recommendation ? displayScore(recommendation.score) : "—"}</strong>
      <p className="mt-2 text-[0.68rem] leading-4 text-[var(--muted)]">{summary}</p>
    </div>
  );
}

function ConditionItem({ icon, label, value, detail, border = "" }: { icon: React.ReactNode; label: string; value: string; detail: string; border?: "right-bottom" | "bottom" | "right" | "" }) {
  const borderClasses = border === "right-bottom" ? "border-b border-r" : border === "bottom" ? "border-b" : border === "right" ? "border-r" : "";
  return (
    <div className={`grid min-w-0 grid-cols-[1.8rem_1fr] items-center gap-2 border-[var(--line)] px-2 py-4 ${borderClasses}`}>
      <span aria-hidden="true" className="grid size-7 place-items-center rounded-[0.55rem] bg-[var(--surface-muted)] text-[var(--sea-deep)]">{icon}</span>
      <div className="min-w-0"><span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</span><strong className="mt-1 block truncate text-sm">{value}</strong><span className="mt-0.5 block text-[0.65rem] text-[var(--muted)]">{detail}</span></div>
    </div>
  );
}

function SectionHeading({ title, meta }: { title: string; meta: string }) {
  return <div className="mx-1 mb-2 mt-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2><span className="text-xs font-bold text-[var(--sea)]">{meta}</span></div>;
}
