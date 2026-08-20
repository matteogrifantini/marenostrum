import { describe, expect, it } from "vitest";

import type { BeachPeriod } from "./beach";
import type { ForecastPoint } from "./forecast";
import { aggregateForecast, circularMeanDegrees } from "./forecast-aggregation";

const forecastPoint = (
  localHour: number,
  overrides: Partial<ForecastPoint> = {},
): ForecastPoint => ({
  beachId: "vendicari",
  sourceId: "open-meteo",
  observedAt: "2026-08-20T05:00:00.000Z",
  forecastAt: `2026-08-20T${String(localHour - 2).padStart(2, "0")}:00:00.000Z`,
  sourceQuality: "high",
  windDirectionDegrees: localHour === 8 ? 350 : localHour === 10 ? 10 : localHour * 10,
  windSpeedKmh: localHour + 2,
  gustSpeedKmh: localHour === 10 ? 24 : localHour + 10,
  waveHeightMeters: localHour / 20,
  waveDirectionDegrees: localHour === 8 ? 350 : localHour === 10 ? 10 : localHour * 10,
  weather:
    localHour === 14
      ? "pioggia"
      : localHour === 12 || localHour === 16
        ? "nuvoloso"
        : localHour === 10 || localHour === 18
          ? "poco nuvoloso"
          : "sereno",
  weatherCode: localHour === 14 ? 61 : 0,
  temperatureCelsius: localHour + 16,
  apparentTemperatureCelsius: localHour + 17,
  waterTemperatureCelsius: localHour + 17,
  cloudCoverPercent: localHour * 5,
  precipitationProbabilityPercent: localHour === 14 ? 90 : localHour * 5,
  ...overrides,
});

const points = [8, 10, 12, 14, 16, 18].map((hour) => forecastPoint(hour));

describe("aggregateForecast", () => {
  it("selects Europe/Rome day parts and aggregates their hourly points", () => {
    const morning = aggregateForecast(points, {
      date: "2026-08-20",
      period: "morning",
    });
    const afternoon = aggregateForecast(points, {
      date: "2026-08-20",
      period: "afternoon",
    });

    expect(morning?.hourly).toHaveLength(3);
    expect(morning?.gustSpeedKmh).toBe(24);
    expect(afternoon?.hourly).toHaveLength(3);
    expect(afternoon?.date).toBe("2026-08-20");
    expect(afternoon?.period).toBe("afternoon");
  });

  it("emits only even local hours in the selected window", () => {
    const allDay = aggregateForecast(points, {
      date: "2026-08-20",
      period: "all-day",
    });

    expect(allDay?.hourly?.map((point) => point.time)).toEqual([
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
    ]);
  });

  it("uses circular means, maximum wave and precipitation, and severe weather", () => {
    const allDay = aggregateForecast(points, {
      date: "2026-08-20",
      period: "all-day",
    });

    expect(circularMeanDegrees([350, 10])).toBeCloseTo(0, 8);
    expect(allDay?.waveHeightMeters).toBe(0.9);
    expect(allDay?.precipitationProbabilityPercent).toBe(90);
    expect(allDay?.weather).toBe("pioggia");
    expect(allDay?.waterTemperatureCelsius).toBe(30);
  });

  it.each<BeachPeriod>(["morning", "afternoon", "all-day"])(
    "returns undefined when %s has no usable wave data",
    (period) => {
      const noWaves = points.map((point) => ({
        ...point,
        waveHeightMeters: null,
        waveDirectionDegrees: null,
      }));

      expect(
        aggregateForecast(noWaves, { date: "2026-08-20", period }),
      ).toBeUndefined();
    },
  );

  it("keeps partial marine gaps visible in the timeline and degrades confidence", () => {
    const partialWaves = points.map((point, index) =>
      index === 1
        ? {
            ...point,
            waveHeightMeters: null,
            waveDirectionDegrees: null,
          }
        : point,
    );

    const allDay = aggregateForecast(partialWaves, {
      date: "2026-08-20",
      period: "all-day",
    });

    expect(allDay?.sourceQuality).toBe("medium");
    expect(allDay?.hourly).toHaveLength(6);
    expect(allDay?.hourly?.[1]).toMatchObject({
      time: "10:00",
      waveHeightMeters: null,
    });
    expect(allDay?.waveHeightMeters).toBe(0.9);
  });
});
