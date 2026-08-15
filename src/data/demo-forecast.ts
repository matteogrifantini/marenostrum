import type { BeachConditions, BeachPeriod } from "../domain/beach";

export const DEMO_FORECAST_DATES = [
  "2026-08-15",
  "2026-08-16",
  "2026-08-17",
  "2026-08-18",
] as const;

type ForecastDelta = {
  wind: number;
  gust: number;
  wave: number;
  temperature: number;
  cloud: number;
  weather?: BeachConditions["weather"];
};

type BaseConditions = Omit<
  BeachConditions,
  "date" | "period" | "observedAt" | "hourly" | "feelsLikeCelsius" | "seaState"
>;

const PERIOD_DELTAS: Record<BeachPeriod, ForecastDelta> = {
  "all-day": { wind: 0, gust: 0, wave: 0, temperature: 0, cloud: 0 },
  morning: { wind: -2, gust: -3, wave: -0.05, temperature: -2, cloud: -4 },
  afternoon: { wind: 4, gust: 5, wave: 0.15, temperature: 2, cloud: 8 },
};

const DAY_DELTAS: Record<(typeof DEMO_FORECAST_DATES)[number], ForecastDelta> = {
  "2026-08-15": { wind: 0, gust: 0, wave: 0, temperature: 0, cloud: 0, weather: "sereno" },
  "2026-08-16": { wind: 2, gust: 3, wave: 0.08, temperature: 1, cloud: 4, weather: "sereno" },
  "2026-08-17": { wind: 5, gust: 7, wave: 0.18, temperature: -1, cloud: 18, weather: "poco nuvoloso" },
  "2026-08-18": { wind: -1, gust: -1, wave: -0.06, temperature: 0, cloud: -5, weather: "sereno" },
};

const BASE_CONDITIONS: Record<string, BaseConditions> = {
  "cala-del-gelsomino": {
    sourceQuality: "high",
    windDirectionDegrees: 315,
    windSpeedKmh: 7,
    gustSpeedKmh: 12,
    waveHeightMeters: 0.2,
    weather: "sereno",
    temperatureCelsius: 30,
    waterTemperatureCelsius: 25,
    cloudCoverPercent: 8,
  },
  "tonnara-di-vendicari": {
    sourceQuality: "high",
    windDirectionDegrees: 315,
    windSpeedKmh: 10,
    gustSpeedKmh: 18,
    waveHeightMeters: 0.3,
    weather: "sereno",
    temperatureCelsius: 29,
    waterTemperatureCelsius: 25,
    cloudCoverPercent: 12,
  },
  "spiaggia-della-marchesa": {
    sourceQuality: "medium",
    windDirectionDegrees: 315,
    windSpeedKmh: 12,
    gustSpeedKmh: 20,
    waveHeightMeters: 0.4,
    weather: "poco nuvoloso",
    temperatureCelsius: 29,
    waterTemperatureCelsius: 24,
    cloudCoverPercent: 24,
  },
};

export type DemoForecast = Record<
  string,
  Record<string, Record<BeachPeriod, BeachConditions>>
>;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function seaStateFor(waveHeightMeters: number): BeachConditions["seaState"] {
  if (waveHeightMeters >= 0.8) return "agitato";
  if (waveHeightMeters >= 0.45) return "mosso";
  return "calmo";
}

function createHourlyForecast(
  temperatureCelsius: number,
  windSpeedKmh: number,
  gustSpeedKmh: number,
  waveHeightMeters: number,
  cloudCoverPercent: number,
) {
  return [0, 2, 4, 6, 8, 10].map((offset) => ({
    time: `${String(8 + offset).padStart(2, "0")}:00`,
    windSpeedKmh: Math.max(0, Math.round(windSpeedKmh + (offset > 4 ? 2 : offset > 1 ? 1 : 0))),
    gustSpeedKmh: Math.max(0, Math.round(gustSpeedKmh + (offset > 4 ? 3 : offset > 1 ? 1 : 0))),
    waveHeightMeters: Number(
      clamp(waveHeightMeters + (offset > 5 ? 0.05 : 0), 0.05, 1.8).toFixed(1),
    ),
    temperatureCelsius: Math.round(temperatureCelsius + (offset >= 4 ? 2 : 0)),
    cloudCoverPercent: Math.round(clamp(cloudCoverPercent + (offset === 10 ? 4 : 0), 0, 100)),
  }));
}

function createConditions(
  date: (typeof DEMO_FORECAST_DATES)[number],
  period: BeachPeriod,
  base: BaseConditions,
): BeachConditions {
  const dayDelta = DAY_DELTAS[date];
  const periodDelta = PERIOD_DELTAS[period];
  const windSpeedKmh = Math.max(0, base.windSpeedKmh + dayDelta.wind + periodDelta.wind);
  const gustSpeedKmh = Math.max(0, base.gustSpeedKmh + dayDelta.gust + periodDelta.gust);
  const waveHeightMeters = Number(
    clamp(base.waveHeightMeters + dayDelta.wave + periodDelta.wave, 0.05, 1.8).toFixed(1),
  );
  const temperatureCelsius = Math.round(
    base.temperatureCelsius + dayDelta.temperature + periodDelta.temperature,
  );
  const cloudCoverPercent = Math.round(
    clamp(base.cloudCoverPercent + dayDelta.cloud + periodDelta.cloud, 0, 100),
  );

  return {
    ...base,
    observedAt: `${date}T07:00:00+02:00`,
    date,
    period,
    windSpeedKmh,
    gustSpeedKmh,
    waveHeightMeters,
    weather: dayDelta.weather ?? base.weather,
    temperatureCelsius,
    feelsLikeCelsius: temperatureCelsius + 1,
    cloudCoverPercent,
    seaState: seaStateFor(waveHeightMeters),
    hourly: createHourlyForecast(
      temperatureCelsius,
      windSpeedKmh,
      gustSpeedKmh,
      waveHeightMeters,
      cloudCoverPercent,
    ),
  };
}

export const demoForecast = Object.fromEntries(
  Object.entries(BASE_CONDITIONS).map(([slug, base]) => [
    slug,
    Object.fromEntries(
      DEMO_FORECAST_DATES.map((date) => [
        date,
        Object.fromEntries(
          (Object.keys(PERIOD_DELTAS) as BeachPeriod[]).map((period) => [
            period,
            createConditions(date, period, base),
          ]),
        ) as Record<BeachPeriod, BeachConditions>,
      ]),
    ) as Record<string, Record<BeachPeriod, BeachConditions>>,
  ]),
) as DemoForecast;
