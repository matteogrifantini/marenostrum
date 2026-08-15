"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";
import type { BeachAccess } from "../domain/beach";

export type BeachFilters = {
  access: BeachAccess | "all";
  service: "all" | "pineta" | "parcheggio" | "snorkeling";
};

type FilterSheetProps = {
  open: boolean;
  filters: BeachFilters;
  onClose: () => void;
  onChange: (filters: BeachFilters) => void;
};

const accessOptions: Array<{ value: BeachFilters["access"]; label: string }> = [
  { value: "all", label: "Tutti gli accessi" },
  { value: "facile", label: "Accesso facile" },
  { value: "moderato", label: "Accesso moderato" },
  { value: "difficile", label: "Accesso impegnativo" },
];

const serviceOptions: Array<{ value: BeachFilters["service"]; label: string }> = [
  { value: "all", label: "Tutti i servizi" },
  { value: "pineta", label: "Pineta" },
  { value: "parcheggio", label: "Parcheggio" },
  { value: "snorkeling", label: "Snorkeling" },
];

export function FilterSheet({ open, filters, onClose, onChange }: FilterSheetProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const reset = () => onChange({ access: "all", service: "all" });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(20,44,57,0.3)] p-3 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Chiudi filtri"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        className="relative w-full max-w-lg rounded-[1.75rem] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(20,44,57,0.22)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--sea-deep)]">
              Filtri fattuali
            </p>
            <h2 id="filter-sheet-title" className="mt-2 font-serif text-3xl font-semibold tracking-[-0.05em]">
              Affina la scelta
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi filtri"
            className="grid size-11 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--ink)] transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sand-muted)] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <FilterGroup
          label="Accesso"
          options={accessOptions}
          value={filters.access}
          onSelect={(value) => onChange({ ...filters, access: value })}
        />
        <FilterGroup
          label="Servizi e ambiente"
          options={serviceOptions}
          value={filters.service}
          onSelect={(value) => onChange({ ...filters, service: value })}
        />

        <div className="mt-7 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-full px-4 text-sm font-bold text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
          >
            Azzera filtri
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-white transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sea-deep)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
          >
            Mostra risultati
          </button>
        </div>
      </section>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-bold text-[var(--ink)]">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(option.value)}
              className={[
                "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
                selected
                  ? "bg-[var(--ink)] text-white"
                  : "bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--sand-muted)]",
              ].join(" ")}
            >
              {selected ? <Check aria-hidden="true" size={15} /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
