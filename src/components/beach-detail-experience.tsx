"use client";

import { Compass, Droplets, ShieldCheck, Sun, ThermometerSun, Waves, Wind } from "lucide-react";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import {
  DEMO_DATE_OPTIONS,
  getDemoRecommendationFor,
} from "../data/demo-beaches";
import { ConditionMetric } from "./condition-metric";
import { DetailHero } from "./detail-hero";
import { DetailTabs, type DetailTab } from "./detail-tabs";
import { HourlyForecast } from "./hourly-forecast";
import { NextDays, type NextDay } from "./next-days";
import { PageShell } from "./page-shell";
import { PeriodPicker } from "./period-picker";

type BeachDetailExperienceProps = {
  recommendation: BeachRecommendation;
  date: string;
  period: BeachPeriod;
};

const directionNames = [
  "Tramontana",
  "Grecale",
  "Levante",
  "Scirocco",
  "Ostro",
  "Libeccio",
  "Ponente",
  "Maestrale",
];

function directionName(degrees: number) {
  return directionNames[Math.round((degrees % 360) / 45) % directionNames.length];
}

export function BeachDetailExperience({
  recommendation,
  date,
  period,
}: BeachDetailExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<DetailTab>("oggi");
  const { beach } = recommendation;
  const days = useMemo<NextDay[]>(
    () =>
      DEMO_DATE_OPTIONS.map((option) => {
        const daily = getDemoRecommendationFor(beach.slug, {
          date: option.iso,
          period: "all-day",
        });

        return {
          iso: option.iso,
          label: option.label,
          score: daily?.score ?? 0,
          wind: daily ? `${daily.conditions.windSpeedKmh} km/h vento` : "Dati non disponibili",
        };
      }),
    [beach.slug],
  );

  const handlePeriodChange = (nextPeriod: BeachPeriod) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("date", date);
    nextParams.set("period", nextPeriod);
    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <PageShell>
      <main className="min-h-screen pb-14">
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-8 sm:py-6">
          <DetailHero recommendation={recommendation} date={date} period={period} />

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)]">
            <section className="min-w-0 overflow-hidden rounded-[1.75rem] bg-[var(--surface)] p-5 shadow-[0_18px_60px_rgba(20,44,57,0.08)] sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[var(--sea-deep)]">Previsioni</p>
                <PeriodPicker value={period} onChange={handlePeriodChange} />
              </div>

              <div className="mt-6">
                <DetailTabs active={activeTab} onChange={setActiveTab} />
              </div>

              {activeTab === "oggi" ? (
                <TodayPanel recommendation={recommendation} />
              ) : null}
              {activeTab === "info" ? <InfoPanel recommendation={recommendation} /> : null}
              {activeTab === "vento" ? <WindPanel recommendation={recommendation} /> : null}
            </section>

            <aside className="h-fit rounded-[1.75rem] bg-[var(--surface-muted)] p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Perché questo score</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.05em]">Il segnale di oggi</h2>
                </div>
                <span className="grid size-11 place-items-center rounded-full bg-[var(--sun-soft)] text-[var(--ink)]">
                  <ShieldCheck aria-hidden="true" size={19} />
                </span>
              </div>
              <div className="mt-7 space-y-5">
                <ScoreLine label="Vento" value={recommendation.factors.wind} max={45} />
                <ScoreLine label="Mare" value={recommendation.factors.sea} max={25} />
                <ScoreLine label="Meteo" value={recommendation.factors.weather} max={20} />
                <ScoreLine label="Accesso" value={recommendation.factors.access} max={10} />
              </div>
              <p className="mt-7 border-t border-[var(--line)] pt-5 text-sm leading-6 text-[var(--muted)]">
                {recommendation.reason} Il numero sintetizza le condizioni, la spiegazione resta visibile.
              </p>
            </aside>
          </div>

          <NextDays slug={beach.slug} days={days} selectedDate={date} period={period} />
        </div>
      </main>
    </PageShell>
  );
}

function TodayPanel({
  recommendation,
}: {
  recommendation: BeachRecommendation;
}) {
  const { conditions } = recommendation;

  return (
    <div className="mt-7">
      <p className="rounded-[1.25rem] bg-[var(--sea-soft)]/70 p-4 text-sm font-semibold leading-6 text-[var(--ink-soft)]">
        {recommendation.reason}
      </p>

      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-[var(--line)] py-5 sm:grid-cols-4">
        <ConditionMetric
          icon={<Sun aria-hidden="true" size={17} />}
          label="Cielo"
          value={conditions.weather}
          description={conditions.cloudCoverPercent !== undefined ? `${conditions.cloudCoverPercent}% nuvole` : undefined}
        />
        <ConditionMetric
          icon={<Wind aria-hidden="true" size={17} />}
          label="Vento"
          value={`${conditions.windSpeedKmh} km/h`}
          description={`${conditions.gustSpeedKmh} raffiche`}
        />
        <ConditionMetric
          icon={<Waves aria-hidden="true" size={17} />}
          label="Mare"
          value={`${conditions.waveHeightMeters.toFixed(1)} m`}
          description={conditions.seaState}
        />
        <ConditionMetric
          icon={<ThermometerSun aria-hidden="true" size={17} />}
          label="Temperatura"
          value={`${conditions.temperatureCelsius}°`}
          description={conditions.waterTemperatureCelsius ? `acqua ${conditions.waterTemperatureCelsius}°` : undefined}
        />
      </div>

      <HourlyForecast hourly={conditions.hourly} />

      {recommendation.beach.warnings?.length ? (
        <div className="mt-7 rounded-[1.25rem] bg-[var(--sun-soft)] p-4 text-sm leading-6 text-[var(--ink)]">
          <p className="font-bold">Da sapere prima di partire</p>
          <ul className="mt-2 space-y-1 text-[var(--ink-soft)]">
            {recommendation.beach.warnings.map((warning) => (
              <li key={warning}>· {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function InfoPanel({ recommendation }: { recommendation: BeachRecommendation }) {
  const { beach } = recommendation;

  return (
    <div className="mt-7 grid gap-7 sm:grid-cols-2">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">La spiaggia</p>
        <p className="mt-3 text-base leading-7 text-[var(--ink-soft)]">{beach.description}</p>
        <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
          Accesso {beach.access}. Orientamento {beach.orientationLabel ?? beach.coast.toLowerCase()}.
        </p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Cosa trovi</p>
        <ul className="mt-3 space-y-3 text-sm font-semibold text-[var(--ink-soft)]">
          {beach.services?.map((service) => <li key={service}>· {service}</li>)}
          {beach.facts?.map((fact) => <li key={fact}>· {fact}</li>)}
        </ul>
      </div>
      <div className="sm:col-span-2 border-t border-[var(--line)] pt-5 text-xs leading-5 text-[var(--muted)]">
        Foto: {beach.imageCredit ?? "Archivio locale"} · {beach.imageLicense ?? "Asset locale"}. Le immagini sono attribuite nel repository.
      </div>
    </div>
  );
}

function WindPanel({ recommendation }: { recommendation: BeachRecommendation }) {
  const { beach, conditions } = recommendation;

  return (
    <div className="mt-7">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ConditionMetric icon={<Compass aria-hidden="true" size={17} />} label="Direzione" value={directionName(conditions.windDirectionDegrees)} />
        <ConditionMetric icon={<Wind aria-hidden="true" size={17} />} label="Vento" value={`${conditions.windSpeedKmh} km/h`} description="medio" />
        <ConditionMetric icon={<Wind aria-hidden="true" size={17} />} label="Raffiche" value={`${conditions.gustSpeedKmh} km/h`} />
        <ConditionMetric icon={<Droplets aria-hidden="true" size={17} />} label="Mare" value={conditions.seaState ?? "calmo"} description={`${conditions.waveHeightMeters.toFixed(1)} m`} />
      </div>
      <div className="mt-7 rounded-[1.25rem] bg-[var(--surface-muted)] p-5">
        <p className="text-sm font-bold text-[var(--ink)]">Esposizione della spiaggia</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          {beach.shelter.length ? `Riparata da ${beach.shelter.join(", ")}.` : "Nessuna direzione riparata registrata."} {beach.orientationLabel ?? beach.coast}.
        </p>
      </div>
    </div>
  );
}

function ScoreLine({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        <span className="text-[var(--muted)]">{value}/{max}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/70">
        <div className="h-full rounded-full bg-[var(--sea)]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
