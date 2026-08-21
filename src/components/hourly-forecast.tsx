import { CloudSun, ThermometerSun, Waves, Wind } from "lucide-react";
import type { BeachConditions } from "../domain/beach";

type HourlyForecastProps = {
  hourly?: NonNullable<BeachConditions["hourly"]>;
};

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  if (!hourly?.length) return null;

  return (
    <section aria-label="Previsioni orarie" className="mt-7">
      <div
        aria-label="Previsioni orarie scorrevoli"
        className="hourly-rail relative overflow-x-auto rounded-[1.25rem] pb-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)]"
        role="region"
        tabIndex={0}
      >
        <div
          role="list"
          aria-label="Previsioni orarie"
          className="relative flex min-w-max items-start gap-3 px-2 pr-8"
        >
          <div
            aria-hidden="true"
            className="absolute left-12 right-12 top-1.5 h-px bg-[var(--sea)]/35"
          />
          {hourly.map((item, index) => (
            <div
              key={item.time}
              role="listitem"
              className="relative w-[7.75rem] shrink-0 snap-start text-center"
            >
              <div
                aria-hidden="true"
                className={[
                  "relative z-10 mx-auto size-3 rounded-full ring-4 ring-[var(--surface)]",
                  index % 2 === 0 ? "bg-[var(--sea)]" : "bg-[var(--sun)]",
                ].join(" ")}
              />
              <p className="mt-4 text-xs font-bold text-[var(--ink)]">{item.time}</p>
                <div className="mt-3 rounded-[1.25rem] border border-[var(--sea)]/15 bg-[var(--sea-soft)]/65 p-3 text-left shadow-[0_6px_18px_rgba(20,88,104,0.06)]">
                <p className="flex items-center gap-1 text-sm font-bold text-[var(--ink)]">
                  <ThermometerSun aria-hidden="true" size={14} className="text-[var(--sea-deep)]" />
                  {item.temperatureCelsius}°
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--ink-soft)]">
                  <Wind aria-hidden="true" size={13} />
                  {item.windSpeedKmh} km/h
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--ink-soft)]">
                  <Waves aria-hidden="true" size={13} />
                  {item.waveHeightMeters === null
                    ? "—"
                    : `${item.waveHeightMeters.toFixed(1)} m`}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--ink-soft)]">
                  <CloudSun aria-hidden="true" size={13} />
                  {item.cloudCoverPercent}% nuvole
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
