import { describe, expect, it, vi } from "vitest";

import type { ForecastPoint } from "../domain/forecast";
import {
  createSupabaseForecastWriteStore,
  synchronizeForecasts,
  type ForecastWriteClient,
  type ForecastWriteStore,
} from "./forecast-sync";

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

function createProductionClient() {
  const state = {
    beachSelects: [] as string[],
    sourceUpserts: [] as Array<{ values: unknown; options: unknown }>,
    sourceUpdates: [] as Array<{ values: unknown; column: string; value: unknown }>,
    forecastUpserts: [] as Array<{ rows: unknown; options: unknown }>,
    cleanupFilters: [] as Array<{
      sourceColumn: string;
      sourceId: unknown;
      cutoffColumn: string;
      cutoff: unknown;
    }>,
    conditionRows: new Map<string, unknown>(),
  };

  const client = {
    from(table: string) {
      if (table === "beaches") {
        return {
          select(columns: string) {
            state.beachSelects.push(columns);
            return {
              async eq() {
                return {
                  data: [{ id: "beach-1", latitude: "36.8", longitude: "15.1" }],
                  error: null,
                };
              },
            };
          },
        };
      }

      if (table === "data_sources") {
        return {
          upsert(values: unknown, options: unknown) {
            state.sourceUpserts.push({ values, options });
            return {
              select() {
                return {
                  async single() {
                    return { data: { id: "open-meteo-source" }, error: null };
                  },
                };
              },
            };
          },
          update(values: unknown) {
            return {
              async eq(column: string, value: unknown) {
                state.sourceUpdates.push({ values, column, value });
                return { error: null };
              },
            };
          },
        };
      }

      if (table === "beach_conditions") {
        return {
          async upsert(rows: Array<Record<string, unknown>>, options: unknown) {
            state.forecastUpserts.push({ rows, options });
            for (const row of rows) {
              state.conditionRows.set(
                `${row.beach_id}:${row.source_id}:${row.forecast_at}`,
                row,
              );
            }
            return { error: null };
          },
          delete() {
            return {
              eq(sourceColumn: string, sourceId: unknown) {
                return {
                  async lt(cutoffColumn: string, cutoff: unknown) {
                    state.cleanupFilters.push({ sourceColumn, sourceId, cutoffColumn, cutoff });
                    return { error: null };
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  };

  return { client: client as unknown as ForecastWriteClient, state };
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

  it("persists idempotent production rows through an injected Supabase client", async () => {
    const { client, state } = createProductionClient();
    const createStoreWithClient: (client: ForecastWriteClient) => Promise<ForecastWriteStore> =
      createSupabaseForecastWriteStore;
    const store = await createStoreWithClient(client);
    const points = [point(0)];
    points[0].sourceId = "open-meteo-source";
    const provider = { fetch: vi.fn(async () => points) };

    await synchronizeForecasts({ store, provider, now });
    await synchronizeForecasts({ store, provider, now });

    expect(state.beachSelects).toEqual(["id, latitude, longitude", "id, latitude, longitude"]);
    expect(state.sourceUpserts).toEqual([
      {
        values: {
          slug: "open-meteo",
          name: "Open-Meteo",
          url: "https://open-meteo.com/",
          quality: "high",
          is_public: true,
        },
        options: { onConflict: "slug" },
      },
      {
        values: {
          slug: "open-meteo",
          name: "Open-Meteo",
          url: "https://open-meteo.com/",
          quality: "high",
          is_public: true,
        },
        options: { onConflict: "slug" },
      },
    ]);
    expect(provider.fetch).toHaveBeenNthCalledWith(
      1,
      [{ id: "beach-1", latitude: 36.8, longitude: 15.1 }],
      { sourceId: "open-meteo-source", observedAt: now },
    );
    expect(provider.fetch).toHaveBeenNthCalledWith(
      2,
      [{ id: "beach-1", latitude: 36.8, longitude: 15.1 }],
      { sourceId: "open-meteo-source", observedAt: now },
    );
    expect(state.forecastUpserts).toEqual([
      {
        rows: [
          {
            beach_id: "beach-1",
            source_id: "open-meteo-source",
            observed_at: "2026-08-20T06:00:00.000Z",
            forecast_at: "2026-08-20T06:00:00.000Z",
            wind_direction_degrees: 180,
            wind_speed_kmh: 14,
            gust_speed_kmh: 20,
            wave_height_meters: 0.4,
            wave_direction_degrees: 160,
            weather: "sereno",
            weather_code: 0,
            temperature_celsius: 28,
            apparent_temperature_celsius: 29,
            water_temperature_celsius: 25,
            cloud_cover_percent: 15,
            precipitation_probability_percent: 0,
            computed_score: null,
            score_version: "real-1.0",
          },
        ],
        options: { onConflict: "beach_id,source_id,forecast_at" },
      },
      {
        rows: [
          {
            beach_id: "beach-1",
            source_id: "open-meteo-source",
            observed_at: "2026-08-20T06:00:00.000Z",
            forecast_at: "2026-08-20T06:00:00.000Z",
            wind_direction_degrees: 180,
            wind_speed_kmh: 14,
            gust_speed_kmh: 20,
            wave_height_meters: 0.4,
            wave_direction_degrees: 160,
            weather: "sereno",
            weather_code: 0,
            temperature_celsius: 28,
            apparent_temperature_celsius: 29,
            water_temperature_celsius: 25,
            cloud_cover_percent: 15,
            precipitation_probability_percent: 0,
            computed_score: null,
            score_version: "real-1.0",
          },
        ],
        options: { onConflict: "beach_id,source_id,forecast_at" },
      },
    ]);
    expect(state.conditionRows).toHaveLength(1);
    expect(state.sourceUpdates).toEqual([
      {
        values: { last_checked_at: "2026-08-20T06:00:00.000Z" },
        column: "id",
        value: "open-meteo-source",
      },
      {
        values: { last_checked_at: "2026-08-20T06:00:00.000Z" },
        column: "id",
        value: "open-meteo-source",
      },
    ]);
    expect(state.cleanupFilters).toEqual([
      {
        sourceColumn: "source_id",
        sourceId: "open-meteo-source",
        cutoffColumn: "forecast_at",
        cutoff: "2026-08-18T06:00:00.000Z",
      },
      {
        sourceColumn: "source_id",
        sourceId: "open-meteo-source",
        cutoffColumn: "forecast_at",
        cutoff: "2026-08-18T06:00:00.000Z",
      },
    ]);
  });
});
