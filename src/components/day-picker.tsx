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
      className="day-picker flex min-w-0 gap-2 overflow-x-auto pb-1"
      role="group"
    >
      {options.map((option) => {
        const selected = option.iso === value;

        return (
          <button
            key={option.iso}
            type="button"
            aria-label={option.label}
            aria-pressed={selected}
            onClick={() => onChange(option.iso)}
            className={[
              "min-h-11 min-w-[5.1rem] shrink-0 rounded-full px-4 py-2 text-left transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
              selected
                ? "bg-[var(--ink)] text-white shadow-[0_8px_20px_rgba(20,44,57,0.16)]"
                : "bg-white/75 text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)]",
            ].join(" ")}
          >
            <span className="block text-sm font-bold leading-4">
              {option.label}
            </span>
            <span
              className={[
                "mt-0.5 block text-[0.68rem] font-semibold uppercase tracking-[0.12em]",
                selected ? "text-white/65" : "text-[var(--muted)]",
              ].join(" ")}
            >
              {option.relativeLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
