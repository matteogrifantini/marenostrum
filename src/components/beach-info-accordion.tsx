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
      <button
        type="button"
        aria-label="Scopri la spiaggia"
        aria-expanded={open}
        aria-controls="beach-info-accordion-content"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between gap-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span aria-hidden="true" className="detail-emoji detail-emoji-mobile">🏖️</span>
          <span className="text-base font-extrabold tracking-[-0.025em]">Scopri la spiaggia</span>
        </span>
        <span className={`grid size-10 shrink-0 place-items-center rounded-full bg-[var(--sun-soft)] text-[var(--sun-dark)] transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}>
          <ChevronDown aria-hidden="true" size={19} />
        </span>
      </button>

      {open ? (
        <div id="beach-info-accordion-content" className="mt-4 border-t border-[var(--line)] pt-5">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold tracking-[-0.035em]">{beach.name}</h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
                <MapPin aria-hidden="true" size={14} />
                {beach.municipality} · costa {beach.coast.toLowerCase()}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{beach.description}</p>

          <div className="mt-4 grid grid-cols-2 border-t border-[var(--line)]">
            {detail.facts.map((fact, index) => (
              <div
                key={`${fact.label}-${index}`}
                className={`grid grid-cols-[2.35rem_1fr] gap-2 border-[var(--line)] px-2 py-4 sm:grid-cols-[2rem_1fr] ${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b" : ""}`}
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
      ) : null}
    </section>
  );
}
