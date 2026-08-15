import {
  ArrowLeft,
  Clock3,
  MapPin,
  ShieldCheck,
  ThermometerSun,
  Waves,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { demoBeachInputs, getDemoRecommendation } from "../../../data/demo-beaches";

export function generateStaticParams() {
  return demoBeachInputs.map(({ beach }) => ({ slug: beach.slug }));
}

export default async function BeachPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recommendation = getDemoRecommendation(slug);

  if (!recommendation) {
    notFound();
  }

  const { beach, conditions } = recommendation;

  return (
    <main className="min-h-screen bg-[var(--sand)] text-[var(--ink)]">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
        <Link
          href="/#scelte"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-4 py-2.5 text-sm font-bold text-[var(--ink-soft)] transition-colors hover:border-[var(--sea)] hover:text-[var(--sea-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Torna alle scelte
        </Link>

        <section className="mt-8 overflow-hidden rounded-[2rem] bg-[var(--ink)] text-[var(--sand)] shadow-[0_24px_80px_rgba(20,44,57,0.16)]">
          <div className="contour-lines relative min-h-[19rem] p-6 sm:min-h-[25rem] sm:p-10">
            <div className="sea-glow pointer-events-none absolute -right-20 -top-20 size-72 rounded-full" />
            <div className="relative flex min-h-[17rem] flex-col justify-between sm:min-h-[23rem]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--sand-muted)]">
                  <MapPin aria-hidden="true" size={15} />
                  {beach.municipality} · {beach.coast}
                </p>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-[var(--sand-muted)]">
                  Scheda demo
                </span>
              </div>
              <div className="max-w-3xl">
                <h1 className="font-serif text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.84] tracking-[-0.07em]">
                  {beach.name}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-[var(--sand-muted)] sm:text-lg">
                  {beach.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(17rem,0.7fr)]">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Sicilia score · oggi
                </p>
                <p className="mt-2 font-serif text-7xl font-semibold leading-none tracking-[-0.07em]">
                  {recommendation.score}
                  <span className="ml-2 text-xl tracking-normal text-[var(--muted)]">/ 100</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--sea-soft)] px-3 py-2 text-sm font-bold text-[var(--sea-deep)]">
                <ShieldCheck aria-hidden="true" size={16} />
                {recommendation.label}
              </span>
            </div>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
              {recommendation.reason}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 border-y border-[var(--line)] py-5 sm:grid-cols-4">
              <Metric icon={<Wind aria-hidden="true" size={17} />} label="Vento">
                {conditions.windSpeedKmh} km/h
              </Metric>
              <Metric icon={<Waves aria-hidden="true" size={17} />} label="Onde">
                {conditions.waveHeightMeters.toFixed(1)} m
              </Metric>
              <Metric icon={<ThermometerSun aria-hidden="true" size={17} />} label="Aria">
                {conditions.temperatureCelsius}°
              </Metric>
              <Metric icon={<Clock3 aria-hidden="true" size={17} />} label="Dati">
                Aggiornati
              </Metric>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-muted)] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
              Come leggiamo il risultato
            </p>
            <div className="mt-6 space-y-5">
              <ScoreLine label="Vento" value={recommendation.factors.wind} />
              <ScoreLine label="Mare" value={recommendation.factors.sea} />
              <ScoreLine label="Meteo" value={recommendation.factors.weather} />
              <ScoreLine label="Accesso" value={recommendation.factors.access} />
              <ScoreLine label="Affinità" value={recommendation.factors.fit} />
            </div>
            <p className="mt-7 border-t border-[var(--line)] pt-5 text-sm leading-6 text-[var(--muted)]">
              Confidenza del dato: <strong className="text-[var(--ink)]">{recommendation.confidence}</strong>.
              Prima della partenza verificheremo fonti e orari di aggiornamento.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
      <span className="text-[var(--sea-deep)]">{icon}</span>
      <span>
        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {label}
        </span>
        <span className="block font-semibold">{children}</span>
      </span>
    </div>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        <span className="text-[var(--muted)]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full bg-[var(--sea)]"
          style={{ width: Math.min(100, value * 2.2) + "%" }}
        />
      </div>
    </div>
  );
}
