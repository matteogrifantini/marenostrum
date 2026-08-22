"use client";

import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ForecastControls, ForecastDetails, ForecastSummary, InfoContent, PreviewHero, PrototypeStage } from "./shared";

export function PanelVariant() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <PrototypeStage>
      <PreviewHero
        action={(
          <button type="button" aria-label="Apri informazioni" onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full bg-[var(--sun)] text-[var(--ink)] shadow-[0_6px_17px_rgba(8,47,61,0.16)] transition-transform duration-200 ease-out active:scale-[0.96]">
            <Info aria-hidden="true" size={19} />
          </button>
        )}
      />
      <div className="mx-auto max-w-[52rem]">
        <ForecastControls />
        <ForecastSummary />
        <ForecastDetails />
      </div>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(6,28,35,0.42)] p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={() => setOpen(false)}>
          <section role="dialog" aria-modal="true" aria-label="Informazioni sulla spiaggia" className="max-h-[min(88vh,48rem)] w-full max-w-[42rem] overflow-y-auto rounded-[1.5rem] bg-[var(--sand)] p-4 shadow-[0_24px_80px_rgba(6,28,35,0.28)] sm:p-6" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--sea-deep)]">Informazioni</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.05em]">La spiaggia</h2>
              </div>
              <button type="button" aria-label="Chiudi informazioni" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full bg-[var(--surface)] text-[var(--ink)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.08)]">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <div className="mt-5"><InfoContent /></div>
          </section>
        </div>
      ) : null}
    </PrototypeStage>
  );
}
