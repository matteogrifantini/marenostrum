"use client";

import { useState } from "react";
import { ForecastDetails, ForecastSummary, InfoContent, PreviewHero, PrototypeStage, WindContent } from "./shared";

type SliderView = "oggi" | "info" | "vento";

const views: Array<{ id: SliderView; label: string }> = [
  { id: "oggi", label: "Oggi" },
  { id: "info", label: "Info" },
  { id: "vento", label: "Vento" },
];

export function SliderVariant() {
  const [view, setView] = useState<SliderView>("oggi");

  return (
    <PrototypeStage>
      <PreviewHero />
      <div className="mx-auto max-w-[52rem]">
        <div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-[var(--control-surface)] p-1 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.06)]" role="tablist" aria-label="Vista spiaggia">
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              aria-controls={`prototype-${item.id}-panel`}
              onClick={() => setView(item.id)}
              className={`min-h-11 rounded-full px-3 text-sm font-black transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.98] ${view === item.id ? "bg-[var(--ink)] text-white shadow-[0_8px_18px_rgba(20,44,57,0.14)]" : "text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div id={`prototype-${view}-panel`} role="tabpanel" aria-label={views.find((item) => item.id === view)?.label} className="mt-4">
          {view === "oggi" ? (
            <>
              <ForecastSummary />
              <ForecastDetails />
            </>
          ) : null}
          {view === "info" ? <InfoContent surface="card" /> : null}
          {view === "vento" ? <WindContent /> : null}
        </div>
      </div>
    </PrototypeStage>
  );
}
