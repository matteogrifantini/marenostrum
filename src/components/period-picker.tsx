"use client";

import { ChevronDown } from "lucide-react";
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
    <label className={`relative inline-flex min-h-11 w-full min-w-0 max-w-none items-center rounded-full bg-[var(--control-surface)] text-[var(--ink)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.06)] lg:w-auto lg:max-w-[12rem] ${className}`.trim()}>
      <span className="sr-only">Periodo</span>
      <select
        aria-label="Periodo"
        value={value}
        onChange={(event) => onChange(event.target.value as BeachPeriod)}
        className="min-h-11 w-full min-w-0 max-w-full appearance-none rounded-full bg-transparent py-2 pl-4 pr-10 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-[var(--sun)] lg:w-auto"
      >
        {periods.map((period) => (
          <option key={period} value={period}>
            {getPeriodLabel(period)}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute right-3 text-[var(--muted)]"
      />
    </label>
  );
}
