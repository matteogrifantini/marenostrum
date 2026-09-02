"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";
import {
  BEACH_ACCESS_FILTER_OPTIONS,
  BEACH_SERVICE_FILTER_OPTIONS,
  BEACH_TAG_FILTER_OPTIONS,
  DEFAULT_BEACH_FILTERS,
  type BeachFilters,
} from "../domain/beach-filters";

type FilterSheetProps = {
  open: boolean;
  filters: BeachFilters;
  onClose: () => void;
  onChange: (filters: BeachFilters) => void;
  onlySheltered?: boolean;
  onToggleSheltered?: () => void;
  onlyWebcam?: boolean;
  onToggleWebcam?: () => void;
};

export function FilterSheet({
  open,
  filters,
  onClose,
  onChange,
  onlySheltered = false,
  onToggleSheltered,
  onlyWebcam = false,
  onToggleWebcam,
}: FilterSheetProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const reset = () => {
    onChange({ ...DEFAULT_BEACH_FILTERS });
    if (onlySheltered && onToggleSheltered) onToggleSheltered();
    if (onlyWebcam && onToggleWebcam) onToggleWebcam();
  };

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
        className="relative max-h-[min(85vh,48rem)] w-full max-w-lg overflow-y-auto rounded-[1.75rem] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(20,44,57,0.22)] sm:p-7"
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

        {(onToggleSheltered || onToggleWebcam) && (
          <fieldset className="mt-6">
            <legend className="text-sm font-bold text-[var(--ink)]">Condizioni & Live</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {onToggleSheltered && (
                <button
                  type="button"
                  aria-pressed={onlySheltered}
                  onClick={onToggleSheltered}
                  className={[
                    "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
                    onlySheltered
                      ? "bg-emerald-700 text-white"
                      : "bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--sand-muted)]",
                  ].join(" ")}
                >
                  {onlySheltered ? <Check aria-hidden="true" size={15} /> : <span>🛡️</span>}
                  Riparate oggi dal vento
                </button>
              )}
              {onToggleWebcam && (
                <button
                  type="button"
                  aria-pressed={onlyWebcam}
                  onClick={onToggleWebcam}
                  className={[
                    "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
                    onlyWebcam
                      ? "bg-red-600 text-white"
                      : "bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--sand-muted)]",
                  ].join(" ")}
                >
                  {onlyWebcam ? <Check aria-hidden="true" size={15} /> : <span>📹</span>}
                  Con webcam
                </button>
              )}
            </div>
          </fieldset>
        )}

        <FilterGroup
          label="Accesso"
          options={BEACH_ACCESS_FILTER_OPTIONS}
          selected={filters.access}
          onToggle={(value) => onChange({ ...filters, access: toggleValue(filters.access, value) })}
        />
        <FilterGroup
          label="Tipo di spiaggia"
          options={BEACH_TAG_FILTER_OPTIONS.slice(0, 6)}
          selected={filters.tags}
          onToggle={(value) => onChange({ ...filters, tags: toggleValue(filters.tags, value) })}
        />
        <FilterGroup
          label="Esperienza"
          options={BEACH_TAG_FILTER_OPTIONS.slice(6)}
          selected={filters.tags}
          onToggle={(value) => onChange({ ...filters, tags: toggleValue(filters.tags, value) })}
        />
        <FilterGroup
          label="Servizi"
          options={BEACH_SERVICE_FILTER_OPTIONS}
          selected={filters.services}
          onToggle={(value) => onChange({ ...filters, services: toggleValue(filters.services, value) })}
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

function toggleValue<T extends string>(values: readonly T[], value: T) {
  return values.includes(value) ? values.filter((current) => current !== value) : [...values, value];
}

function FilterGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  selected: readonly T[];
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-bold text-[var(--ink)]">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option.value)}
              className={[
                "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
                isSelected
                  ? "bg-[var(--ink)] text-white"
                  : "bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--sand-muted)]",
              ].join(" ")}
            >
              {isSelected ? <Check aria-hidden="true" size={15} /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
