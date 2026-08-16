"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  MapPin,
  ThermometerSun,
  Waves,
  Wind,
} from "lucide-react";
import { useState } from "react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import { ConditionMetric } from "./condition-metric";

type BeachCardProps = {
  recommendation: BeachRecommendation;
  date: string;
  period: BeachPeriod;
  featured?: boolean;
};

export function BeachCard({ recommendation, date, period, featured = false }: BeachCardProps) {
  const { beach, conditions } = recommendation;
  const [favorite, setFavorite] = useState(false);
  const detailHref = `/spiagge/${beach.slug}?date=${encodeURIComponent(date)}&period=${period}`;
  const image = beach.image ?? "/images/beaches/cala-del-gelsomino.jpg";
  const imageAlt = beach.imageAlt ?? `Foto di ${beach.name}`;
  const displayScore = (Math.max(0, Math.min(100, recommendation.score)) / 10).toFixed(1);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] bg-[var(--surface)] shadow-[0_18px_60px_rgba(20,44,57,0.1)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_68px_rgba(20,44,57,0.14)] focus-within:-translate-y-0.5">
      <div className={featured ? "relative h-[290px] overflow-hidden sm:h-[370px]" : "relative h-[220px] overflow-hidden sm:h-[245px]"}>
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

        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end gap-3 text-white">
          <div className="min-w-0 pr-24">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <MapPin aria-hidden="true" size={14} />
              {beach.municipality} · {beach.coast}
            </p>
            <h3 className="mt-1 font-serif text-2xl font-semibold tracking-[-0.04em]">
              {beach.name}
            </h3>
          </div>
        </div>
        <div
          aria-label={`Sicilia score ${displayScore} su 10, ${recommendation.label}`}
          className="pointer-events-none absolute bottom-4 right-4 rounded-[1.1rem] bg-white/92 px-3 py-2 text-[var(--ink)] shadow-[0_8px_20px_rgba(10,28,35,0.16)] backdrop-blur-md"
        >
          <span className="block text-[0.55rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            Sicilia score
          </span>
          <span className="mt-0.5 flex items-baseline gap-1">
            <strong className="font-serif text-2xl font-semibold leading-none tracking-[-0.06em]">
              {displayScore}
            </strong>
            <span className="text-xs font-semibold text-[var(--muted)]">/10</span>
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[var(--line)] py-4">
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
