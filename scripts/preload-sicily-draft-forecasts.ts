import { createClient } from "@supabase/supabase-js";
import catalog from "../data/catalog/sicilia/beaches.json";
import type { ForecastPoint } from "../src/domain/forecast";
import { fetchOpenMeteoForecasts } from "../src/lib/open-meteo/open-meteo";
import {
  collectForecastIdentityKeys,
  forecastIdentityKey,
  type DraftForecastBeachRow,
  type ForecastIdentityRow,
} from "../src/services/draft-forecast-preload";

const APPLY_FLAG = "--apply";

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin configuration is missing");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function throwOnError(context: string, error: { message: string } | null) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function getRequestedMode() {
  const unsupportedFlags = process.argv.slice(2).filter((argument) => argument !== APPLY_FLAG);

  if (unsupportedFlags.length > 0) {
    throw new Error(`Unsupported argument: ${unsupportedFlags[0]}`);
  }

  return process.argv.includes(APPLY_FLAG) ? "applied" : "dry-run";
}

function buildForecastRows(points: ForecastPoint[]) {
  return points.map((point) => ({
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
}

function summarizeForecast(points: ForecastPoint[]) {
  const pointsByBeach = new Map<string, number>();

  for (const point of points) {
    pointsByBeach.set(point.beachId, (pointsByBeach.get(point.beachId) ?? 0) + 1);
  }

  return {
    points: points.length,
    points_per_beach: [...new Set(pointsByBeach.values())],
    marine_missing: points.filter(
      (point) => point.waveHeightMeters === null || point.waterTemperatureCelsius === null,
    ).length,
  };
}

async function getOrCreateOpenMeteoSource(client: ReturnType<typeof createSupabaseAdminClient>) {
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

  throwOnError("Open-Meteo source lookup failed", error);

  if (!data?.id) throw new Error("Open-Meteo source lookup returned no id");
  return data.id as string;
}

async function main() {
  const mode = getRequestedMode();
  const client = createSupabaseAdminClient();
  const slugs = catalog.map((beach) => beach.slug);

  const { data, error } = await client
    .from("beaches")
    .select("id, slug, latitude, longitude, is_published, publication_status")
    .in("slug", slugs);

  throwOnError("Beach lookup failed", error);

  const rows = (data ?? []) as DraftForecastBeachRow[];
  const returnedSlugs = new Set(rows.map((row) => row.slug));
  const missingSlugs = slugs.filter((slug) => !returnedSlugs.has(slug));

  if (missingSlugs.length > 0) {
    throw new Error(`Catalog beaches are missing from Supabase: ${missingSlugs.join(", ")}`);
  }

  const draftBeaches = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  }));

  const observedAt = new Date();
  const fetchedPoints = await fetchOpenMeteoForecasts(draftBeaches, {
    sourceId: "draft-preload",
    observedAt,
  });
  const draftIds = new Set(draftBeaches.map((beach) => beach.id));
  const foreignPoints = fetchedPoints.filter((point) => !draftIds.has(point.beachId));

  if (foreignPoints.length > 0) {
    throw new Error("Refusing forecast preload with a beach outside the draft selection");
  }

  const summary = summarizeForecast(fetchedPoints);

  if (mode === "dry-run") {
    console.log(
      JSON.stringify(
        {
          mode,
          project: "marenostrum",
          beaches: draftBeaches.length,
          ...summary,
          writes: 0,
        },
        null,
        2,
      ),
    );
    return;
  }

  const sourceId = await getOrCreateOpenMeteoSource(client);
  const points = fetchedPoints.map((point) => ({ ...point, sourceId }));
  const forecastRows = buildForecastRows(points);
  const BATCH_SIZE = 500;
  for (let i = 0; i < forecastRows.length; i += BATCH_SIZE) {
    const batch = forecastRows.slice(i, i + BATCH_SIZE);
    const { error: upsertError } = await client.from("beach_conditions").upsert(batch, {
      onConflict: "beach_id,source_id,forecast_at",
    });
    throwOnError("Forecast preload failed", upsertError);
  }

  const verifiedKeys = await collectForecastIdentityKeys(async ({ from, to }) => {
    const { data, error } = await client
      .from("beach_conditions")
      .select("beach_id, forecast_at")
      .in("beach_id", [...draftIds])
      .eq("source_id", sourceId)
      .order("beach_id")
      .order("forecast_at")
      .range(from, to);

    throwOnError("Forecast preload verification failed", error);
    return (data ?? []) as ForecastIdentityRow[];
  });
  const missingForecasts = points.filter(
    (point) => !verifiedKeys.has(forecastIdentityKey(point.beachId, point.forecastAt)),
  );

  if (missingForecasts.length > 0) {
    throw new Error(`Forecast preload verification missed ${missingForecasts.length} rows`);
  }

  console.log(
    JSON.stringify(
      {
        mode,
        project: "marenostrum",
        beaches: draftBeaches.length,
        ...summary,
        writes: forecastRows.length,
        verified_rows: points.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Draft forecast preload failed";
  console.error(message);
  process.exitCode = 1;
});
