"use client";

import { ChevronDown, LocateFixed, SlidersHorizontal } from "lucide-react";

export type Proximity = "sicilia" | "nearby";

type ContextControlsProps = {
  proximity: Proximity;
  onProximityChange: (value: Proximity) => void;
  onOpenFilters: () => void;
};

export function ContextControls({
  proximity,
  onProximityChange,
  onOpenFilters,
}: ContextControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex min-h-11 rounded-full bg-white/75 p-1 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.08)]">
        <button
          type="button"
          aria-pressed={proximity === "sicilia"}
          onClick={() => onProximityChange("sicilia")}
          className={[
            "min-h-9 rounded-full px-4 text-sm font-bold transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
            proximity === "sicilia"
              ? "bg-white text-[var(--ink)] shadow-[0_4px_12px_rgba(20,44,57,0.08)]"
              : "text-[var(--muted)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          Tutta la Sicilia
        </button>
        <button
          type="button"
          aria-pressed={proximity === "nearby"}
          onClick={() => onProximityChange("nearby")}
          className={[
            "inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
            proximity === "nearby"
              ? "bg-white text-[var(--ink)] shadow-[0_4px_12px_rgba(20,44,57,0.08)]"
              : "text-[var(--muted)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          <LocateFixed aria-hidden="true" size={15} />
          Vicino a me
        </button>
      </div>
      <button
        type="button"
        onClick={onOpenFilters}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/75 px-4 text-sm font-bold text-[var(--ink-soft)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.08)] transition-[transform,background-color,color] duration-200 ease-out hover:bg-white hover:text-[var(--ink)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
      >
        <SlidersHorizontal aria-hidden="true" size={16} />
        Filtri
        <ChevronDown aria-hidden="true" size={15} />
      </button>
    </div>
  );
}
