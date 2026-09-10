"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { useEffect, type RefObject } from "react";
import type { Beach } from "../domain/beach";
import type { BeachDetailContent } from "../domain/beach-detail-content";

type BeachInfoAccordionProps = {
  beach: Beach;
  detail: BeachDetailContent;
  open: boolean;
  onToggle: () => void;
  panelRef: RefObject<HTMLElement | null>;
};

export function BeachInfoAccordion({ beach, detail, open, onToggle, panelRef }: BeachInfoAccordionProps) {
  useEffect(() => {
    if (!open) return;

    panelRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [open, panelRef]);

  return (
    <section
      id="beach-info-accordion"
      ref={panelRef}
      aria-label="La spiaggia"
      className="detail-surface detail-enter mt-4 scroll-mt-6 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="detail-emoji detail-emoji-mobile">🏖️</span>
        <h2 className="text-base font-extrabold tracking-[-0.025em] text-[var(--ink)]">Scopri la spiaggia</h2>
      </div>

      <div role="group" aria-label="Anteprima della spiaggia" className="mt-3 rounded-[1rem] bg-[var(--surface-muted)]/55 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-extrabold tracking-[-0.035em]">{beach.name}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
              <MapPin aria-hidden="true" size={14} />
              {beach.municipality} · costa {beach.coast.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <p className={`${open ? "" : "line-clamp-2"} flex-1 text-sm leading-6 text-[var(--ink-soft)]`}>
            {beach.description}
          </p>
          <button
            type="button"
            aria-label="Scopri la spiaggia"
            aria-expanded={open}
            aria-controls="beach-info-accordion-content"
            onClick={onToggle}
            className={`grid size-10 shrink-0 place-items-center rounded-full bg-[var(--sun-soft)] text-[var(--sun-dark)] transition-transform duration-200 ease-out hover:bg-[var(--sun)]/30 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)] ${open ? "rotate-180" : ""}`}
          >
            <ChevronDown aria-hidden="true" size={19} />
          </button>
        </div>

        {detail.facts.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {detail.facts.slice(0, 2).map((fact, index) => (
              <span key={`${fact.label}-${index}`} className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[0.68rem] font-bold text-[var(--ink-soft)]">
                {fact.label}: {fact.value}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div
        id="beach-info-accordion-content"
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-4 border-t border-[var(--line)] pt-4">
            <div className="grid grid-cols-2">
              {detail.facts.map((fact, index) => (
                <div
                  key={`${fact.label}-${index}`}
                  className={`grid grid-cols-[2.35rem_1fr] gap-2 border-[var(--line)] px-2 py-4 sm:grid-cols-[2rem_1fr] ${index % 2 === 0 ? "border-r" : ""} ${index < detail.facts.length - 2 ? "border-b" : ""}`}
                >
                  <span aria-hidden="true" className="detail-emoji detail-emoji-mobile">{fact.emoji}</span>
                  <div>
                    <strong className="block text-xs">{fact.label}</strong>
                    <span className="mt-1 block text-[0.68rem] leading-4 text-[var(--muted)]">{fact.value}</span>
                  </div>
                </div>
              ))}
            </div>
            {detail.facts.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">Nessuna informazione aggiuntiva disponibile.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
