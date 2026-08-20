import { describe, expect, it, vi } from "vitest";

import type { ForecastPoint } from "../domain/forecast";
import { synchronizeForecasts, type ForecastWriteStore } from "./forecast-sync";

const now = new Date("2026-08-20T06:00:00.000Z");

function point(index: number): ForecastPoint {
  return {
    beachId: `beach-${Math.floor(index / 96) + 1}`,
    sourceId: "open-meteo-source",
    observedAt: now.toISOString(),
    forecastAt: new Date(now.getTime() + index * 60 * 60 * 1000).toISOString(),
    sourceQuality: "high",
    windDirectionDegrees: 180,
    windSpeedKmh: 14,
    gustSpeedKmh: 20,
    waveHeightMeters: 0.4,
    waveDirectionDegrees: 160,
    weather: "sereno",
    weatherCode: 0,
    temperatureCelsius: 28,
    apparentTemperatureCelsius: 29,
    waterTemperatureCelsius: 25,
    cloudCoverPercent: 15,
    precipitationProbabilityPercent: 0,
  };
}

function createStore(): ForecastWriteStore {
  return {
    getPublishedBeaches: vi.fn(async () => [
      { id: "beach-1", latitude: 36.8, longitude: 15.1 },
      { id: "beach-2", latitude: 36.9, longitude: 15.2 },
      { id: "beach-3", latitude: 37, longitude: 15.3 },
    ]),
    getOrCreateSource: vi.fn(async () => ({ id: "open-meteo-source" })),
    upsertForecasts: vi.fn(async () => undefined),
    markSourceChecked: vi.fn(async () => undefined),
    deleteSourceForecastsBefore: vi.fn(async () => undefined),
  };
}

describe("synchronizeForecasts", () => {
  it("writes a fetched batch before marking and cleaning the source", async () => {
    const store = createStore();
    const events: string[] = [];
    const points = Array.from({ length: 288 }, (_, index) => point(index));
    const provider = {
      fetch: vi.fn(async () => {
        events.push("fetch");
        return points;
      }),
    };
    store.upsertForecasts = vi.fn(async () => {
      events.push("upsert");
    });
    store.markSourceChecked = vi.fn(async () => {
      events.push("mark");
    });
    store.deleteSourceForecastsBefore = vi.fn(async () => {
      events.push("cleanup");
    });

    const result = await synchronizeForecasts({ store, provider, now });

    expect(provider.fetch).toHaveBeenCalledTimes(1);
    expect(store.upsertForecasts).toHaveBeenCalledWith(points);
    expect(store.markSourceChecked).toHaveBeenCalledWith("open-meteo-source", now.toISOString());
    expect(store.deleteSourceForecastsBefore).toHaveBeenCalledWith(
      "open-meteo-source",
      "2026-08-18T06:00:00.000Z",
    );
    expect(events).toEqual(["fetch", "upsert", "mark", "cleanup"]);
    expect(result).toEqual({ beaches: 3, points: 288, observedAt: now.toISOString() });
  });

  it("does not write or clean up when the provider rejects", async () => {
    const store = createStore();
    const provider = {
      fetch: vi.fn(async () => Promise.reject(new Error("provider unavailable"))),
    };

    await expect(synchronizeForecasts({ store, provider, now })).rejects.toThrow(
      "provider unavailable",
    );

    expect(store.upsertForecasts).not.toHaveBeenCalled();
    expect(store.markSourceChecked).not.toHaveBeenCalled();
    expect(store.deleteSourceForecastsBefore).not.toHaveBeenCalled();
  });

  it("does not clean up if the upsert fails", async () => {
    const store = createStore();
    const provider = { fetch: vi.fn(async () => [point(0)]) };
    store.upsertForecasts = vi.fn(async () => Promise.reject(new Error("write unavailable")));

    await expect(synchronizeForecasts({ store, provider, now })).rejects.toThrow("write unavailable");

    expect(store.markSourceChecked).not.toHaveBeenCalled();
    expect(store.deleteSourceForecastsBefore).not.toHaveBeenCalled();
  });
});
