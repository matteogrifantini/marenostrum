import Link from "next/link";
import type { BeachPeriod } from "../domain/beach";
import { buildNextDayHref } from "../domain/detail-query";
import { formatScoreOutOf100 } from "../domain/score";

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
      <h2 id="next-days-title" className="font-serif text-3xl font-semibold tracking-[-0.05em]">Prossimi giorni</h2>
      <div className="relative mt-5">
        <ol
          aria-label="Timeline delle previsioni"
          className="flex min-w-0 snap-x gap-3 overflow-x-auto px-1 pb-4 pr-12 [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)]"
          tabIndex={0}
        >
          {days.map((day, index) => {
          const selected = day.iso === selectedDate;

          return (
            <li
              key={day.iso}
              className={[
                "relative w-[11rem] shrink-0 snap-start pt-6",
                index < days.length - 1
                  ? "after:absolute after:left-6 after:right-[-0.75rem] after:top-[0.35rem] after:h-px after:bg-[var(--sea)]/35 after:content-['']"
                  : "",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "absolute left-3 top-0 z-10 size-3 rounded-full ring-4 ring-[var(--sand)]",
                  "bg-[var(--sea)]",
                ].join(" ")}
              />
              <Link
                href={buildNextDayHref(slug, day.iso, period)}
                scroll={false}
                aria-current={selected ? "date" : undefined}
                className={[
                  "block min-h-[7.4rem] rounded-[1.25rem] border p-4 transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
                  selected
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white shadow-[0_8px_20px_rgba(20,44,57,0.14)]"
                    : "border-[var(--line)] bg-[var(--surface-muted)] text-[var(--ink)] hover:bg-[var(--sand-muted)]",
                ].join(" ")}
              >
                <span className={selected ? "text-white/70" : "text-[var(--muted)]"}>{day.label}</span>
                <strong className="mt-3 block font-serif text-3xl leading-none tracking-[-0.06em]">
                  {formatScoreOutOf100(day.score)}
                </strong>
                <span className={selected ? "mt-1 block text-xs font-semibold text-white/70" : "mt-1 block text-xs font-semibold text-[var(--muted)]"}>
                  {day.wind}
                </span>
              </Link>
            </li>
          );
          })}
        </ol>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--sand)] via-[var(--sand)]/80 to-transparent"
        />
      </div>
    </section>
  );
}
