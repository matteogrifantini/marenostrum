"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  Heart,
  MapPin,
  ThermometerSun,
  Waves,
  Wind,
} from "lucide-react";
import { useState } from "react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import { BeachScore } from "./beach-score";
import { ConditionMetric } from "./condition-metric";

type BeachCardProps = {
  recommendation: BeachRecommendation;
  date: string;
  period: BeachPeriod;
};

export function BeachCard({ recommendation, date, period }: BeachCardProps) {
  const { beach, conditions } = recommendation;
  const [favorite, setFavorite] = useState(false);
  const detailHref = `/spiagge/${beach.slug}?date=${encodeURIComponent(date)}&period=${period}`;
  const image = beach.image ?? "/images/beaches/cala-del-gelsomino.jpg";
  const imageAlt = beach.imageAlt ?? `Foto di ${beach.name}`;

  return (
    <article className="group overflow-hidden rounded-[1.75rem] bg-[var(--surface)] shadow-[0_18px_60px_rgba(20,44,57,0.1)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_68px_rgba(20,44,57,0.14)] focus-within:-translate-y-0.5">
      <div className="relative h-[220px] overflow-hidden sm:h-[245px]">
        <Link
          href={detailHref}
          aria-label={`Apri la scheda di ${beach.name}`}
          className="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--sun)]"
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-[rgba(10,28,35,0.68)] via-transparent to-[rgba(10,28,35,0.08)]" />
        </Link>

        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[var(--ink)] shadow-[0_6px_16px_rgba(20,44,57,0.12)] backdrop-blur-sm">
            {recommendation.label}
          </span>
          <button
            type="button"
            aria-label={favorite ? `Rimuovi ${beach.name} dai preferiti` : `Salva ${beach.name}`}
            aria-pressed={favorite}
            onClick={() => setFavorite((current) => !current)}
            className="pointer-events-auto grid size-11 shrink-0 place-items-center rounded-full bg-white/90 text-[var(--ink)] shadow-[0_6px_16px_rgba(20,44,57,0.12)] backdrop-blur-sm transition-[transform,background-color,color] duration-200 ease-out hover:bg-white active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
          >
            <Heart
              aria-hidden="true"
              size={18}
              fill={favorite ? "currentColor" : "none"}
              strokeWidth={2.1}
            />
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <MapPin aria-hidden="true" size={14} />
              {beach.municipality} · {beach.coast}
            </p>
            <h3 className="mt-1 font-serif text-2xl font-semibold tracking-[-0.04em]">
              {beach.name}
            </h3>
          </div>
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-xs font-bold backdrop-blur-sm">
            {conditions.date === date ? "Aggiornato" : "Previsione"}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)]">
              <Compass aria-hidden="true" size={15} className="text-[var(--sea-deep)]" />
              Esposta a {beach.orientationLabel ?? beach.coast}
            </p>
            <p className="mt-2 max-w-[18rem] text-sm leading-6 text-[var(--ink-soft)]">
              {recommendation.reason}
            </p>
          </div>
          <BeachScore score={recommendation.score} label={recommendation.label} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[var(--line)] py-4">
          <ConditionMetric
            icon={<Wind aria-hidden="true" size={17} />}
            label="Vento"
            value={`${conditions.windSpeedKmh} km/h`}
            description="medio"
          />
          <ConditionMetric
            icon={<Wind aria-hidden="true" size={17} />}
            label="Raffiche"
            value={`${conditions.gustSpeedKmh} km/h`}
          />
          <ConditionMetric
            icon={<Waves aria-hidden="true" size={17} />}
            label="Onde"
            value={`${conditions.waveHeightMeters.toFixed(1)} m`}
            description={conditions.seaState}
          />
          <ConditionMetric
            icon={<ThermometerSun aria-hidden="true" size={17} />}
            label="Aria"
            value={`${conditions.temperatureCelsius}°`}
            description={
              conditions.waterTemperatureCelsius
                ? `acqua ${conditions.waterTemperatureCelsius}°`
                : undefined
            }
          />
        </div>

        {beach.facts?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {beach.facts.slice(0, 3).map((fact) => (
              <span
                key={fact}
                className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]"
              >
                {fact}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          href={detailHref}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-between rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sea-deep)] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
        >
          Scopri la spiaggia
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </article>
  );
}
