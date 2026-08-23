"use client";

import { CloudSun, ThermometerSun, Waves, Wind } from "lucide-react";
import type { BeachConditions } from "../domain/beach";
import {
  formatTemperatureCelsius,
  formatWaveHeightMeters,
  formatWindSpeedKmh,
  useUserPreferences,
} from "../lib/user-preferences";

type HourlyForecastProps = {
  hourly?: NonNullable<BeachConditions["hourly"]>;
};

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  const preferences = useUserPreferences();
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
          {hourly.map((item) => (
            <div
              key={item.time}
              role="listitem"
              className="relative w-[7.75rem] shrink-0 snap-start text-center"
            >
              <div
                aria-hidden="true"
                className="hourly-timeline-dot relative z-10 mx-auto size-3 rounded-full bg-[var(--sea)] ring-4 ring-[var(--surface)]"
              />
              <p className="mt-4 text-xs font-bold text-[var(--ink)]">{item.time}</p>
                <div className="mt-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-3 text-left shadow-[0_6px_18px_rgba(20,44,57,0.08)]">
                  <p className="flex items-center gap-1 text-sm font-bold text-[var(--ink)]">
                  <ThermometerSun aria-hidden="true" size={14} className="text-[var(--coral)]" />
                  {formatTemperatureCelsius(item.temperatureCelsius, preferences.temperatureUnit)}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--ink)]">
                  <Wind aria-hidden="true" size={13} className="text-[var(--sea-deep)]" />
                  {formatWindSpeedKmh(item.windSpeedKmh, preferences.distanceUnit)}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--ink)]">
                  <Waves aria-hidden="true" size={13} className="text-[var(--sea-deep)]" />
                  {item.waveHeightMeters === null
                    ? "—"
                    : formatWaveHeightMeters(item.waveHeightMeters, preferences.waveHeightUnit)}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--ink)]">
                  <CloudSun aria-hidden="true" size={13} className="text-[var(--sun-dark)]" />
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
