import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  ShieldCheck,
  ThermometerSun,
  Waves,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";
import type { BeachRecommendation } from "../domain/beach";

type BeachCardProps = {
  recommendation: BeachRecommendation;
};

export function BeachCard({ recommendation }: BeachCardProps) {
  const { beach, conditions } = recommendation;

  return (
    <article className="group rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_55px_rgba(20,44,57,0.08)] transition-transform duration-200 hover:-translate-y-0.5 focus-within:-translate-y-0.5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            <MapPin aria-hidden="true" size={14} strokeWidth={2.2} />
            {beach.municipality} · {beach.coast}
          </p>
          <h3 className="font-serif text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[1.75rem]">
            {beach.name}
          </h3>
        </div>
        <div className="flex min-w-[5rem] flex-col items-end">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            Sicilia score
          </span>
          <strong className="font-serif text-4xl leading-none text-[var(--ink)]">
            {recommendation.score}
          </strong>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--sea-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-deep)]">
          <ShieldCheck aria-hidden="true" size={15} />
          {recommendation.label}
        </span>
        <span className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--muted)]">
          Confidenza {recommendation.confidence}
        </span>
      </div>

      <p className="mt-5 max-w-xl text-[1.02rem] leading-7 text-[var(--ink-soft)]">
        {recommendation.reason}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 border-y border-[var(--line)] py-4 sm:grid-cols-4">
        <Condition icon={<Wind aria-hidden="true" size={16} />} label="Vento">
          {conditions.windSpeedKmh} km/h
        </Condition>
        <Condition icon={<Waves aria-hidden="true" size={16} />} label="Onde">
          {conditions.waveHeightMeters.toFixed(1)} m
        </Condition>
        <Condition
          icon={<ThermometerSun aria-hidden="true" size={16} />}
          label="Aria"
        >
          {conditions.temperatureCelsius}°
        </Condition>
        <Condition icon={<Clock3 aria-hidden="true" size={16} />} label="Dati">
          Aggiornati
        </Condition>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">
          {beach.description}
        </p>
        <Link
          href={`/spiagge/${beach.slug}`}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[var(--sea-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
        >
          Apri scheda
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </article>
  );
}

function Condition({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-[var(--ink-soft)]">
      <span className="text-[var(--sea-deep)]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {label}
        </span>
        <span className="block truncate font-semibold">{children}</span>
      </span>
    </div>
  );
}
