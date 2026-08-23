"use client";

import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";
import { ForecastControls, ForecastDetails, ForecastSummary, InfoContent, PreviewHero, PrototypeStage } from "./shared";

export function HeroExpandableVariant() {
  const [open, setOpen] = useState(false);

  return (
    <PrototypeStage>
      <PreviewHero
        titleAction={(
          <button
            type="button"
            aria-label={open ? "Nascondi informazioni" : "Scopri la spiaggia"}
            aria-expanded={open}
            aria-controls="hero-expandable-info-panel"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/35 bg-white/15 px-4 text-sm font-bold text-white shadow-[0_8px_22px_rgba(6,28,35,0.18)] backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-out hover:border-white/55 hover:bg-white/25 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Info aria-hidden="true" size={16} />
            <span>{open ? "Nascondi informazioni" : "Scopri la spiaggia"}</span>
            <ChevronDown aria-hidden="true" size={16} className={`transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`} />
          </button>
        )}
      />
      <div className="mx-auto max-w-[52rem]">
        <ForecastControls />
        <ForecastSummary />
        <ForecastDetails />
        {open ? (
          <section id="hero-expandable-info-panel" aria-label="Informazioni sulla spiaggia" className="mt-4 rounded-[1.35rem] bg-[var(--surface)] p-4 shadow-[0_12px_34px_rgba(20,44,57,0.08)] sm:p-5">
            <InfoContent />
          </section>
        ) : null}
      </div>
    </PrototypeStage>
  );
}
