import Image from "next/image";
import { ArrowLeft, Heart, MapPin, Share2, ThermometerSun, Waves, Wind } from "lucide-react";
import type { ReactNode } from "react";
import {
  prototypeBeach,
  prototypeFacts,
  prototypeForecast,
  prototypeTags,
  prototypeWind,
  type BeachInfoItem,
} from "./prototype-data";

export function PrototypeStage({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--sand)] pb-28 text-[var(--ink)]">
      <div className="mx-auto max-w-[1440px] px-3 py-3 sm:px-6 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-4 rounded-full bg-[var(--surface)] px-4 py-3 shadow-[0_8px_24px_rgba(20,44,57,0.08)] sm:px-5">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--sea-deep)]">Prototipo UX</p>
            <h1 className="mt-0.5 text-base font-black tracking-[-0.03em] sm:text-lg">Informazioni sulla spiaggia</h1>
          </div>
          <span className="hidden rounded-full bg-[var(--sun-soft)] px-3 py-1.5 text-xs font-bold text-[var(--sun-dark)] sm:inline-flex">Cala del Gelsomino</span>
        </div>
        {children}
      </div>
    </main>
  );
}

export function PreviewHero({ action, titleAction }: { action?: ReactNode; titleAction?: ReactNode }) {
  return (
    <section className="relative min-h-[23rem] overflow-hidden rounded-[1.8rem] bg-[var(--ink)] text-white shadow-[0_20px_60px_rgba(20,44,57,0.16)] sm:min-h-[30rem]">
      <Image
        src={prototypeBeach.image}
        alt="Acqua trasparente a Cala del Gelsomino"
        fill
        priority
        sizes="(max-width: 639px) 100vw, 1440px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[rgba(6,28,35,0.84)]" />
      <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-6">
        <button type="button" aria-label="Torna alla home" className="grid size-11 place-items-center rounded-full bg-white/90 text-[var(--ink)] shadow-[0_6px_17px_rgba(8,47,61,0.13)] backdrop-blur-md">
          <ArrowLeft aria-hidden="true" size={19} />
        </button>
        <div className="flex items-center gap-2">
          {action}
          <button type="button" aria-label="Aggiungi ai preferiti" className="grid size-11 place-items-center rounded-full bg-white/90 text-[var(--ink)] shadow-[0_6px_17px_rgba(8,47,61,0.13)] backdrop-blur-md">
            <Heart aria-hidden="true" size={18} />
          </button>
          <button type="button" aria-label="Condividi spiaggia" className="grid size-11 place-items-center rounded-full bg-white/90 text-[var(--ink)] shadow-[0_6px_17px_rgba(8,47,61,0.13)] backdrop-blur-md">
            <Share2 aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
      <div className="absolute inset-x-5 bottom-6 z-10 sm:inset-x-8 sm:bottom-8">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white/80">
          <MapPin aria-hidden="true" size={14} />
          <span>{prototypeBeach.municipality} · {prototypeBeach.coast}</span>
        </div>
        <h2 className="mt-2 max-w-[38rem] font-serif text-[clamp(2.7rem,10vw,5.2rem)] font-semibold leading-[0.86] tracking-[-0.07em]">
          {prototypeBeach.name}
        </h2>
        {titleAction ? <div className="mt-5">{titleAction}</div> : null}
      </div>
    </section>
  );
}

export function ForecastControls() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 rounded-[1.2rem] bg-[var(--surface)] p-2 shadow-[0_10px_32px_rgba(20,44,57,0.07)] sm:flex sm:items-center sm:justify-between">
      <span className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-center text-sm font-bold text-white">Oggi</span>
      <span className="rounded-full px-4 py-2.5 text-center text-sm font-bold text-[var(--ink-soft)]">Domani</span>
      <span className="col-span-2 rounded-full bg-[var(--control-surface)] px-4 py-2.5 text-center text-sm font-bold text-[var(--ink-soft)] sm:col-span-1">Tutto il giorno</span>
    </div>
  );
}

export function ForecastSummary() {
  return (
    <article className="mt-4 rounded-[1.35rem] bg-[var(--score-excellent-soft)] p-4 shadow-[0_10px_30px_rgba(20,44,57,0.07)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--ink-soft)]">Il consiglio di Mare Nostrum</p>
          <h3 className="mt-2 text-xl font-black tracking-[-0.04em]">{prototypeForecast.headline}</h3>
        </div>
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--score-excellent)] text-xl font-black text-white shadow-[0_8px_18px_rgba(20,44,57,0.14)]">{prototypeForecast.score}<small className="ml-0.5 text-[0.55em] font-bold opacity-80">/100</small></span>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">{prototypeForecast.description}</p>
    </article>
  );
}

export function ForecastDetails() {
  const items = [
    { icon: <Wind size={17} />, label: "Vento", value: prototypeForecast.wind, accent: "text-[var(--sea-deep)]" },
    { icon: <Waves size={17} />, label: "Onde", value: prototypeForecast.waves, accent: "text-[var(--sea-deep)]" },
    { icon: <ThermometerSun size={17} />, label: "Acqua", value: prototypeForecast.water, accent: "text-[var(--coral)]" },
  ];

  return (
    <div className="mt-4 grid grid-cols-3 divide-x divide-[var(--line)] rounded-[1.35rem] bg-[var(--surface)] p-4 shadow-[0_10px_30px_rgba(20,44,57,0.06)]">
      {items.map((item) => (
        <div key={item.label} className="px-2 text-center first:pl-0 last:pr-0">
          <span className={`mx-auto grid size-8 place-items-center rounded-full bg-[var(--surface-muted)] ${item.accent}`}>{item.icon}</span>
          <span className="mt-2 block text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--ink-soft)]">{item.label}</span>
          <strong className="mt-1 block text-sm text-[var(--ink)]">{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function InfoIntro() {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.1em] text-[var(--sea-deep)]">La spiaggia</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="font-serif text-3xl font-semibold tracking-[-0.06em]">{prototypeBeach.name}</h3>
        <span className="text-sm font-bold text-[var(--ink-soft)]">{prototypeBeach.municipality} · {prototypeBeach.coast}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{prototypeBeach.description}</p>
    </div>
  );
}

export function InfoTags() {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {prototypeTags.map((tag) => (
        <span key={tag.label} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-bold text-[var(--ink)]">
          <span aria-hidden="true" className="text-base leading-none">{tag.emoji}</span>
          {tag.label}
        </span>
      ))}
    </div>
  );
}

export function InfoCharacteristics({ items = prototypeFacts }: { items?: BeachInfoItem[] }) {
  return (
    <section className="mt-6" aria-labelledby="prototype-characteristics-title">
      <h3 id="prototype-characteristics-title" className="text-lg font-black tracking-[-0.03em]">Caratteristiche della spiaggia</h3>
      <dl className="mt-3 divide-y divide-[var(--line)] rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)]">
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-[2.5rem_1fr] gap-3 px-4 py-3.5 first:rounded-t-[1.1rem] last:rounded-b-[1.1rem]">
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-[0.75rem] bg-[var(--sun-soft)] text-lg">{item.emoji}</span>
            <div>
              <dt className="text-sm font-black text-[var(--ink)]">{item.label}</dt>
              <dd className="mt-0.5 text-sm text-[var(--ink-soft)]">{item.value}</dd>
              {item.note ? <dd className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.note}</dd> : null}
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function InfoContent({ surface = "plain" }: { surface?: "plain" | "card" }) {
  return (
    <div className={surface === "card" ? "rounded-[1.35rem] bg-[var(--surface)] p-4 shadow-[0_12px_34px_rgba(20,44,57,0.08)] sm:p-6" : ""}>
      <InfoIntro />
      <InfoTags />
      <InfoCharacteristics />
    </div>
  );
}

export function WindContent() {
  return (
    <article className="rounded-[1.35rem] bg-[var(--surface)] p-5 shadow-[0_12px_34px_rgba(20,44,57,0.08)] sm:p-7">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--sea-deep)]">Vento e orientamento</p>
      <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">La costa oggi è protetta</h3>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <WindStat label="Direzione" value={prototypeWind.direction} />
        <WindStat label="Vento" value={prototypeWind.speed} />
        <WindStat label="Raffiche" value={prototypeWind.gusts} />
        <WindStat label="Riparo" value="Maestrale" />
      </div>
      <p className="mt-5 text-sm leading-6 text-[var(--ink-soft)]">La posizione della cala e l’orientamento della costa riducono l’esposizione al vento dominante.</p>
    </article>
  );
}

function WindStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] bg-[var(--sea-soft)]/60 p-3">
      <span className="block text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--sea-deep)]">{label}</span>
      <strong className="mt-1 block text-sm text-[var(--ink)]">{value}</strong>
    </div>
  );
}
