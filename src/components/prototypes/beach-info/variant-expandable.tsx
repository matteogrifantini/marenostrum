"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ForecastControls, ForecastDetails, ForecastSummary, InfoContent, PreviewHero, PrototypeStage } from "./shared";

export function ExpandableVariant() {
  const [open, setOpen] = useState(false);

  return (
    <PrototypeStage>
      <PreviewHero />
      <div className="mx-auto max-w-[52rem]">
        <ForecastControls />
        <ForecastSummary />
        <ForecastDetails />
        <section className="mt-4 rounded-[1.35rem] bg-[var(--surface)] p-4 shadow-[0_12px_34px_rgba(20,44,57,0.08)] sm:p-5" aria-labelledby="expandable-info-title">
          <button type="button" aria-label={open ? "Nascondi le informazioni" : "Scopri la spiaggia"} aria-expanded={open} aria-controls="expandable-info-panel" onClick={() => setOpen((current) => !current)} className="flex min-h-12 w-full items-center justify-between gap-4 text-left">
            <span>
              <span className="block text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--sea-deep)]">Scopri il posto</span>
              <span id="expandable-info-title" className="mt-1 block text-lg font-black tracking-[-0.03em]">{open ? "Nascondi le informazioni" : "Scopri la spiaggia"}</span>
            </span>
            <span className={`grid size-10 shrink-0 place-items-center rounded-full bg-[var(--sun-soft)] text-[var(--sun-dark)] transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}>
              <ChevronDown aria-hidden="true" size={19} />
            </span>
          </button>
          {open ? <div id="expandable-info-panel" className="mt-5 border-t border-[var(--line)] pt-5"><InfoContent /></div> : null}
        </section>
      </div>
    </PrototypeStage>
  );
}
