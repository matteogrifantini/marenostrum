"use client";

import type { DateOption } from "../domain/date-selection";

type DayPickerProps = {
  options: DateOption[];
  value: string;
  onChange: (value: string) => void;
};

export function DayPicker({ options, value, onChange }: DayPickerProps) {
  return (
    <div
      aria-label="Scegli il giorno"
      className="day-picker grid min-w-0 grid-cols-4 gap-1 rounded-full bg-[var(--surface-muted)] p-1 lg:flex-1 lg:gap-2 lg:pb-0"
      role="group"
    >
      {options.map((option, index) => {
        const selected = option.iso === value;
        const hasDistinctRelativeLabel = index > 1 && option.label !== option.relativeLabel;

        return (
          <button
            key={option.iso}
            type="button"
            aria-label={option.label}
            aria-pressed={selected}
            onClick={() => onChange(option.iso)}
            className={[
              "min-h-11 min-w-0 rounded-full px-2 py-2 text-center transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)] lg:flex lg:items-center lg:justify-center lg:gap-1 lg:whitespace-nowrap lg:px-3",
              selected
                ? "bg-[var(--ink)] text-white shadow-[0_8px_20px_rgba(20,44,57,0.16)]"
                : "bg-transparent text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            <span className="block text-sm font-bold leading-4 lg:leading-5">
              {option.label}
            </span>
            {hasDistinctRelativeLabel && (
              <span
                className={[
                  "mt-0.5 block text-xs font-semibold uppercase tracking-[0.12em] lg:mt-0 lg:tracking-[0.08em]",
                  selected ? "text-white/65" : "text-[var(--muted)]",
                ].join(" ")}
              >
                {option.relativeLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
