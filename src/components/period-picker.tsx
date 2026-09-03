"use client";

import { getPeriodLabel } from "../domain/date-selection";
import type { BeachPeriod } from "../domain/beach";

const periods: BeachPeriod[] = ["all-day", "morning", "afternoon"];

type PeriodPickerProps = {
  value: BeachPeriod;
  onChange: (value: BeachPeriod) => void;
  className?: string;
};

export function PeriodPicker({ value, onChange, className = "" }: PeriodPickerProps) {
  return (
    <div
      aria-label="Periodo"
      className={`grid min-h-11 w-full min-w-0 grid-cols-3 gap-1 rounded-full bg-[var(--control-surface)] p-1 ${className}`.trim()}
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
              "min-h-11 min-w-0 rounded-full px-2 py-2 text-center text-xs font-bold leading-4 transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)] sm:text-sm",
              selected
                ? "bg-[var(--ink)] text-white shadow-[0_8px_20px_rgba(20,44,57,0.16)]"
                : "bg-transparent text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            {getPeriodLabel(period)}
          </button>
        );
      })}
    </div>
  );
}
