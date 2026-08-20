import type { ForecastPoint } from "../domain/forecast";
import { fetchOpenMeteoForecasts } from "../lib/open-meteo/open-meteo";
import type { createSupabaseAdminClient } from "../lib/supabase/admin";

type PublishedBeach = {
  id: string;
  latitude: number;
  longitude: number;
};

export type ForecastWriteStore = {
  getPublishedBeaches(): Promise<PublishedBeach[]>;
  getOrCreateSource(): Promise<{ id: string }>;
  upsertForecasts(points: ForecastPoint[]): Promise<void>;
  markSourceChecked(sourceId: string, checkedAt: string): Promise<void>;
  deleteSourceForecastsBefore(sourceId: string, cutoff: string): Promise<void>;
};

export type ForecastWriteClient = ReturnType<typeof createSupabaseAdminClient>;

export type ForecastSyncResult = {
  beaches: number;
  points: number;
  observedAt: string;
};

export type ForecastProvider = {
  fetch(
    beaches: PublishedBeach[],
    options: { sourceId: string; observedAt: Date },
  ): Promise<ForecastPoint[]>;
};

export type ForecastSyncDependencies = {
  store: ForecastWriteStore;
  provider: ForecastProvider;
  now: Date;
};

const fortyEightHours = 48 * 60 * 60 * 1000;

export async function synchronizeForecasts({
  store,
  provider,
  now,
}: ForecastSyncDependencies): Promise<ForecastSyncResult> {
  const [beaches, source] = await Promise.all([
    store.getPublishedBeaches(),
    store.getOrCreateSource(),
  ]);
  const observedAt = now.toISOString();

  if (beaches.length === 0) {
    return { beaches: 0, points: 0, observedAt };
  }

  const points = await provider.fetch(beaches, { sourceId: source.id, observedAt: now });

  await store.upsertForecasts(points);
  await store.markSourceChecked(source.id, observedAt);
  await store.deleteSourceForecastsBefore(
    source.id,
    new Date(now.getTime() - fortyEightHours).toISOString(),
  );

  return { beaches: beaches.length, points: points.length, observedAt };
}

function throwWriteError(message: string): never {
  throw new Error(message);
}

export async function createSupabaseForecastWriteStore(
  injectedClient?: ForecastWriteClient,
): Promise<ForecastWriteStore> {
  const client =
    injectedClient ?? (await import("../lib/supabase/admin")).createSupabaseAdminClient();

  return {
    async getPublishedBeaches() {
      const { data, error } = await client
        .from("beaches")
        .select("id, latitude, longitude")
        .eq("is_published", true);

      if (error) throwWriteError("Published beaches are unavailable");

      return (data ?? []).map((beach) => ({
        id: beach.id,
        latitude: Number(beach.latitude),
        longitude: Number(beach.longitude),
      }));
    },

    async getOrCreateSource() {
      const { data, error } = await client
        .from("data_sources")
        .upsert(
          {
            slug: "open-meteo",
            name: "Open-Meteo",
            url: "https://open-meteo.com/",
            quality: "high",
            is_public: true,
          },
          { onConflict: "slug" },
        )
        .select("id")
        .single();

      if (error || !data) throwWriteError("Open-Meteo source is unavailable");
      return { id: data.id };
    },

    async upsertForecasts(points) {
      const rows = points.map((point) => ({
        beach_id: point.beachId,
        source_id: point.sourceId,
        observed_at: point.observedAt,
        forecast_at: point.forecastAt,
        wind_direction_degrees: point.windDirectionDegrees,
        wind_speed_kmh: point.windSpeedKmh,
        gust_speed_kmh: point.gustSpeedKmh,
        wave_height_meters: point.waveHeightMeters,
        wave_direction_degrees: point.waveDirectionDegrees,
        weather: point.weather,
        weather_code: point.weatherCode,
        temperature_celsius: point.temperatureCelsius,
        apparent_temperature_celsius: point.apparentTemperatureCelsius,
        water_temperature_celsius: point.waterTemperatureCelsius,
        cloud_cover_percent: point.cloudCoverPercent,
        precipitation_probability_percent: point.precipitationProbabilityPercent,
        computed_score: null,
        score_version: "real-1.0",
      }));
      const { error } = await client.from("beach_conditions").upsert(rows, {
        onConflict: "beach_id,source_id,forecast_at",
      });

      if (error) throwWriteError("Forecast write is unavailable");
    },

    async markSourceChecked(sourceId, checkedAt) {
      const { error } = await client
        .from("data_sources")
        .update({ last_checked_at: checkedAt })
        .eq("id", sourceId);

      if (error) throwWriteError("Forecast source update is unavailable");
    },

    async deleteSourceForecastsBefore(sourceId, cutoff) {
      const { error } = await client
        .from("beach_conditions")
        .delete()
        .eq("source_id", sourceId)
        .lt("forecast_at", cutoff);

      if (error) throwWriteError("Forecast cleanup is unavailable");
    },
  };
}

const openMeteoForecastProvider: ForecastProvider = {
  fetch(beaches, options) {
    return fetchOpenMeteoForecasts(beaches, options);
  },
};

export async function synchronizeProductionForecasts(): Promise<ForecastSyncResult> {
  return synchronizeForecasts({
    store: await createSupabaseForecastWriteStore(),
    provider: openMeteoForecastProvider,
    now: new Date(),
  });
}
