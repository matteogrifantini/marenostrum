"use client";

import { ChevronDown, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { ForecastControls, ForecastDetails, ForecastSummary, InfoContent, PreviewHero, PrototypeStage } from "./shared";

export function HeroExpandableVariant() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const panel = document.getElementById("hero-expandable-info-panel");
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open]);

  return (
    <PrototypeStage>
      <PreviewHero
        titleAction={(
          <button
            type="button"
            aria-label="Scopri la spiaggia"
            aria-expanded={open}
            aria-controls="hero-expandable-info-panel"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/35 bg-white/15 px-4 text-sm font-bold text-white shadow-[0_8px_22px_rgba(6,28,35,0.18)] backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-out hover:border-white/55 hover:bg-white/25 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Info aria-hidden="true" size={16} />
            <span>Scopri la spiaggia</span>
          </button>
        )}
      />
      <div className="mx-auto max-w-[52rem]">
        <ForecastControls />
        <ForecastSummary />
        <ForecastDetails />
        <section id="hero-expandable-info-panel" aria-labelledby="hero-expandable-info-title" className="mt-4 scroll-mt-6 rounded-[1.35rem] bg-[var(--surface)] p-4 shadow-[0_12px_34px_rgba(20,44,57,0.08)] sm:p-5">
          <button type="button" aria-label="Scopri la spiaggia" aria-expanded={open} aria-controls="hero-expandable-info-panel-content" onClick={() => setOpen((current) => !current)} className="flex min-h-12 w-full items-center justify-between gap-4 text-left">
            <span>
              <span id="hero-expandable-info-title" className="block text-lg font-black tracking-[-0.03em]">Scopri la spiaggia</span>
            </span>
            <span className={`grid size-10 shrink-0 place-items-center rounded-full bg-[var(--sun-soft)] text-[var(--sun-dark)] transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}>
              <ChevronDown aria-hidden="true" size={19} />
            </span>
          </button>
          {open ? (
            <div id="hero-expandable-info-panel-content" className="mt-5 border-t border-[var(--line)] pt-5">
              <InfoContent />
            </div>
          ) : null}
        </section>
      </div>
    </PrototypeStage>
  );
}
