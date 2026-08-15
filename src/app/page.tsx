"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Sun,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BeachCard } from "../components/beach-card";
import { IntentFilter } from "../components/intent-filter";
import { SectionHeading } from "../components/section-heading";
import { getDemoRecommendations } from "../data/demo-beaches";
import type { UserIntent } from "../domain/beach";

const intentCopy: Record<UserIntent, string> = {
  relax: "Baie riparate, acqua calma e il minor numero possibile di decisioni.",
  family: "Accessi semplici, fondali più gentili e spazio per una giornata leggera.",
  explore: "Paesaggi aperti, sentieri e calette che valgono qualche passo in più.",
  "water-sport": "Vento e condizioni che rendono il mare più interessante da vivere.",
};

export default function Home() {
  const [intent, setIntent] = useState<UserIntent>("relax");
  const recommendations = getDemoRecommendations(intent);

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--sand)] text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="flex items-center justify-between border-b border-[var(--line)] py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)]"
            aria-label="Sicilia Beach, home"
          >
            <span className="grid size-10 place-items-center rounded-full bg-[var(--ink)] text-[var(--sand)]">
              <Waves aria-hidden="true" size={19} strokeWidth={2.5} />
            </span>
            <span className="font-serif text-xl font-semibold tracking-[-0.04em]">
              Sicilia Beach
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-[var(--muted)] md:flex">
            <a className="transition-colors hover:text-[var(--ink)]" href="#scelte">
              Scelte di oggi
            </a>
            <a className="transition-colors hover:text-[var(--ink)]" href="#metodo">
              Il metodo
            </a>
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-white transition-colors hover:bg-[var(--sea-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
              href="#scelte"
            >
              Esplora la costa
              <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </nav>
        </header>

        <section className="relative grid gap-10 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(21rem,0.95fr)] lg:items-end lg:gap-16">
          <div className="relative z-10">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--sea-deep)]">
              <Sun aria-hidden="true" size={14} />
              Sicilia, vista dal mare
            </p>
            <h1 className="max-w-3xl font-serif text-[clamp(3.6rem,10vw,8rem)] font-semibold leading-[0.82] tracking-[-0.075em] text-[var(--ink)]">
              Il mare giusto,
              <span className="block text-[var(--sea)]">oggi.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--ink-soft)] sm:text-xl">
              Una guida ragionata alle spiagge siciliane. Dimmi come vuoi stare
              e ti mostro dove il vento, il mare e il tuo tempo si incontrano
              meglio.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4 text-sm font-semibold text-[var(--muted)]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck aria-hidden="true" size={17} className="text-[var(--sea)]" />
                Dati leggibili
              </span>
              <span className="size-1 rounded-full bg-[var(--sun)]" />
              <span>Scelte spiegate, non classifiche</span>
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] bg-[var(--ink)] p-6 text-[var(--sand)] shadow-[0_24px_80px_rgba(20,44,57,0.16)] sm:min-h-[27rem] sm:p-8">
            <div className="contour-lines pointer-events-none absolute inset-0 opacity-60" />
            <div className="sea-glow pointer-events-none absolute -right-20 -top-16 size-64 rounded-full" />
            <div className="relative flex h-full min-h-[19rem] flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sand-muted)]">
                  Il segnale di oggi
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-[var(--sand-muted)]">
                  14 agosto
                </span>
              </div>
              <div>
                <p className="max-w-sm font-serif text-4xl leading-[0.95] tracking-[-0.05em] sm:text-5xl">
                  “Il vento non è un dettaglio. È parte della giornata.”
                </p>
                <div className="mt-7 flex items-end justify-between gap-5 border-t border-white/15 pt-5">
                  <p className="max-w-[15rem] text-sm leading-6 text-[var(--sand-muted)]">
                    Il nostro punteggio mette insieme condizioni e intenzione,
                    così sai anche il perché.
                  </p>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--sun)] text-[var(--ink)]">
                    <ArrowDownRight aria-hidden="true" size={22} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="scelte" className="scroll-mt-8 border-t border-[var(--line)] py-14 sm:py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Partiamo da te"
              title="Come vuoi stare oggi?"
              description={intentCopy[intent]}
            />
            <IntentFilter value={intent} onChange={setIntent} />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.55fr)]">
            <div className="grid gap-5">
              {recommendations.map((recommendation) => (
                <BeachCard
                  key={recommendation.beach.slug}
                  recommendation={recommendation}
                />
              ))}
            </div>

            <aside className="h-fit rounded-[2rem] border border-[var(--line)] bg-[var(--surface-muted)] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-full bg-[var(--sun-soft)] text-[var(--ink)]">
                  <Sparkles aria-hidden="true" size={19} />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                  In costruzione
                </span>
              </div>
              <h3 className="mt-8 font-serif text-3xl font-semibold leading-none tracking-[-0.04em]">
                La Sicilia è lunga. La scelta non deve esserlo.
              </h3>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                Nel prossimo passo aggiungeremo costa per costa, distanza da te,
                segnalazioni locali e una mappa che rimane semplice da leggere.
              </p>
              <div className="mt-7 space-y-3 border-t border-[var(--line)] pt-5 text-sm font-semibold text-[var(--ink-soft)]">
                <p className="flex items-center gap-3">
                  <Check aria-hidden="true" size={17} className="text-[var(--sea)]" />
                  Solo fonti pubbliche e dichiarate
                </p>
                <p className="flex items-center gap-3">
                  <Check aria-hidden="true" size={17} className="text-[var(--sea)]" />
                  Nessun dato personale necessario
                </p>
                <p className="flex items-center gap-3">
                  <Check aria-hidden="true" size={17} className="text-[var(--sea)]" />
                  Progetto open-source nel perimetro free
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section id="metodo" className="grid gap-8 border-t border-[var(--line)] py-14 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Il metodo"
            title="Un punteggio che puoi capire."
            description="Il numero sintetizza; la spiegazione resta sempre visibile."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Leggiamo", "Vento, onde, meteo e accessibilità."],
              ["02", "Incrociamo", "La condizione con il tuo modo di vivere il mare."],
              ["03", "Spieghiamo", "Perché una spiaggia è una buona scelta oggi."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-[1.5rem] border border-[var(--line)] bg-white/45 p-5">
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--sun-dark)]">
                  {number}
                </span>
                <h3 className="mt-10 font-serif text-2xl font-semibold tracking-[-0.04em]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-[var(--line)] py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Sicilia Beach · Primo prototipo pubblico</p>
          <a
            className="inline-flex items-center gap-2 font-bold text-[var(--ink)] hover:text-[var(--sea-deep)]"
            href="#scelte"
          >
            Torna alle scelte
            <MapPinned aria-hidden="true" size={16} />
          </a>
        </footer>
      </div>
    </main>
  );
}
