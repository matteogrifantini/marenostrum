"use client";

import type { BeachPeriod } from "../domain/beach";
import {
  BEACH_PERIODS,
  getPeriodLabel,
  type DateOption,
} from "../domain/date-selection";

type MapDayPeriodPickerProps = {
  options: DateOption[];
  date: string;
  period: BeachPeriod;
  onDateChange: (date: string) => void;
  onPeriodChange: (period: BeachPeriod) => void;
};

function periodControlId(date: string) {
  return `map-period-${date}`;
}

export function MapDayPeriodPicker({
  options,
  date,
  period,
  onDateChange,
  onPeriodChange,
}: MapDayPeriodPickerProps) {
  return (
    <div
      data-testid="map-day-period-picker"
      aria-label="Scegli giorno e periodo"
      className="flex min-w-0 items-stretch gap-1 rounded-full bg-[var(--control-surface)] p-1"
      role="group"
    >
      {options.map((option, index) => {
        const selected = option.iso === date;
        const hasDistinctRelativeLabel = index > 1 && option.label !== option.relativeLabel;
        const periodId = periodControlId(option.iso);

        return (
          <div
            key={option.iso}
            data-testid={`map-day-option-${option.iso}`}
            className={[
              "flex min-w-0 items-stretch rounded-full transition-[flex,background-color,box-shadow] duration-200 ease-out",
              selected
                ? "min-w-[19rem] flex-[2.35] gap-1 bg-[var(--ink)] p-1 text-white shadow-[0_8px_20px_rgba(20,44,57,0.16)]"
                : "flex-1",
            ].join(" ")}
          >
            <button
              type="button"
              aria-label={option.label}
              aria-pressed={selected}
              aria-expanded={selected}
              aria-controls={selected ? periodId : undefined}
              onClick={() => onDateChange(option.iso)}
              className={[
                "min-h-11 min-w-0 flex-1 rounded-full px-2 py-2 text-center text-sm font-bold leading-5 transition-[transform,background-color,color] duration-200 ease-out active:scale-[0.98] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
                selected
                  ? "text-white"
                  : "text-[var(--ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              <span className="block whitespace-nowrap">{option.label}</span>
              {hasDistinctRelativeLabel ? (
                <span className="mt-0.5 block text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-white/65">
                  {option.relativeLabel}
                </span>
              ) : null}
            </button>

            {selected ? (
              <div
                id={periodId}
                aria-label={`Periodo per ${option.label}`}
                className="grid min-w-0 flex-[2.15] grid-cols-3 gap-1"
                role="group"
              >
                {BEACH_PERIODS.map((periodOption) => {
                  const periodSelected = periodOption === period;

                  return (
                    <button
                      key={periodOption}
                      type="button"
                      aria-label={getPeriodLabel(periodOption)}
                      aria-pressed={periodSelected}
                      onClick={() => onPeriodChange(periodOption)}
                      className={[
                        "min-h-11 min-w-0 rounded-full px-0 text-[0.7rem] font-bold leading-4 transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
                        periodSelected
                          ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm"
                          : "text-white/80 hover:bg-white/15 hover:text-white",
                      ].join(" ")}
                    >
                      <span className="block whitespace-nowrap">{getPeriodLabel(periodOption)}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
