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
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {hourly.map((item) => (
          <div key={item.time} className="rounded-[1rem] bg-[var(--surface-muted)] p-3 text-center">
            <p className="text-xs font-bold text-[var(--ink)]">{item.time}</p>
            <p className="mt-3 flex items-center justify-center gap-1 text-sm font-bold text-[var(--ink)]">
              <ThermometerSun aria-hidden="true" size={14} className="text-[var(--sea-deep)]" />
              {item.temperatureCelsius}°
            </p>
            <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-[var(--muted)]">
              <Wind aria-hidden="true" size={13} />
              {item.windSpeedKmh}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-[var(--muted)]">
              <Waves aria-hidden="true" size={13} />
              {item.waveHeightMeters.toFixed(1)} m
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-[var(--muted)]">
              <CloudSun aria-hidden="true" size={13} />
              {item.cloudCoverPercent}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
