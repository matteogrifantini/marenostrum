"use client";

import { getPeriodLabel } from "../domain/date-selection";
import type { BeachPeriod } from "../domain/beach";

const periods: BeachPeriod[] = ["all-day", "morning", "afternoon"];

type PeriodPickerProps = {
  value: BeachPeriod;
  onChange: (value: BeachPeriod) => void;
};

export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  return (
    <div
      aria-label="Scegli il periodo"
      className="inline-flex min-h-11 rounded-full bg-white/70 p-1 shadow-[inset_0_0_0_1px_rgba(20,44,57,0.08)]"
      role="group"
    >
      {periods.map((period) => {
        const selected = period === value;

        return (
          <button
            key={period}
            type="button"
            aria-label={getPeriodLabel(period)}
            aria-pressed={selected}
            onClick={() => onChange(period)}
            className={[
              "min-h-9 rounded-full px-3 text-xs font-bold transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)] sm:px-4 sm:text-sm",
              selected
                ? "bg-[var(--ink)] text-white shadow-[0_4px_12px_rgba(20,44,57,0.14)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {getPeriodLabel(period)}
          </button>
        );
      })}
    </div>
  );
}
