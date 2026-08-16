import { CloudSun, ThermometerSun, Waves, Wind } from "lucide-react";
import type { BeachConditions } from "../domain/beach";

type HourlyForecastProps = {
  hourly?: NonNullable<BeachConditions["hourly"]>;
};

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  if (!hourly?.length) return null;

  return (
    <section aria-labelledby="hourly-title" className="mt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--sea-deep)]">Andamento</p>
          <h3 id="hourly-title" className="mt-1 font-serif text-2xl font-semibold tracking-[-0.04em]">Le prossime ore</h3>
        </div>
        <span className="text-xs font-semibold text-[var(--muted)]">ogni 2 ore</span>
      </div>
      <div className="relative mt-5 overflow-x-auto pb-2">
        <div
          role="list"
          aria-label="Previsioni orarie"
          className="relative flex min-w-max items-start px-2"
        >
          <div
            aria-hidden="true"
            className="absolute left-12 right-12 top-1.5 h-px bg-[var(--sea)]/35"
          />
          {hourly.map((item, index) => (
            <div
              key={item.time}
              role="listitem"
              className="relative w-[7.75rem] shrink-0 text-center"
            >
              <div
                aria-hidden="true"
                className={[
                  "relative z-10 mx-auto size-3 rounded-full ring-4 ring-[var(--surface)]",
                  index % 2 === 0 ? "bg-[var(--sea)]" : "bg-[var(--sun)]",
                ].join(" ")}
              />
              <p className="mt-4 text-xs font-bold text-[var(--ink)]">{item.time}</p>
              <div className="mt-3 rounded-[1.25rem] bg-[var(--sea-soft)]/65 p-3 text-left">
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
                  {item.waveHeightMeters.toFixed(1)} m
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
