import Link from "next/link";
import type { BeachPeriod } from "../domain/beach";
import { buildNextDayHref } from "../domain/detail-query";

export type NextDay = {
  iso: string;
  label: string;
  score: number;
  wind: string;
};

type NextDaysProps = {
  slug: string;
  days: NextDay[];
  selectedDate: string;
  period: BeachPeriod;
};

export function NextDays({ slug, days, selectedDate, period }: NextDaysProps) {
  return (
    <section aria-labelledby="next-days-title" className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--sea-deep)]">Previsioni</p>
          <h2 id="next-days-title" className="mt-1 font-serif text-3xl font-semibold tracking-[-0.05em]">Prossimi giorni</h2>
        </div>
        <span className="text-xs font-semibold text-[var(--muted)]">4 giorni</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {days.map((day) => {
          const selected = day.iso === selectedDate;

          return (
            <Link
              key={day.iso}
              href={buildNextDayHref(slug, day.iso, period)}
              aria-current={selected ? "date" : undefined}
              className={[
                "min-h-[6.7rem] rounded-[1.1rem] p-4 transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
                selected
                  ? "bg-[var(--ink)] text-white shadow-[0_8px_20px_rgba(20,44,57,0.14)]"
                  : "bg-[var(--surface-muted)] text-[var(--ink)] hover:bg-[var(--sand-muted)]",
              ].join(" ")}
            >
              <span className={selected ? "text-white/70" : "text-[var(--muted)]"}>{day.label}</span>
              <strong className="mt-3 block font-serif text-3xl leading-none tracking-[-0.06em]">
                {(day.score / 10).toFixed(1)}
              </strong>
              <span className={selected ? "mt-1 block text-xs font-semibold text-white/70" : "mt-1 block text-xs font-semibold text-[var(--muted)]"}>
                {day.wind}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
