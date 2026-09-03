import { unstable_cache } from "next/cache";
import type {
  Beach,
  BeachAccess,
  BeachPeriod,
  BeachRecommendation,
  SourceQuality,
  UserIntent,
} from "../domain/beach";
import type { ForecastPoint } from "../domain/forecast";
import { aggregateForecast } from "../domain/forecast-aggregation";
import type { CatalogScope } from "../domain/catalog-scope";
import type { PublicationStatus } from "../domain/publication-status";
import { scoreBeach } from "../domain/score";
import { BEACH_WEBCAMS } from "./beach-webcams";

export type BeachRow = {
  id: string;
  slug: string;
  name: string;
  municipality: string;
  country_code?: string | null;
  region_code?: string | null;
  region_name?: string | null;
  region_slug?: string | null;
  province_code?: string | null;
  province_name?: string | null;
  coast: string;
  description: string;
  orientation_degrees: number | string;
  orientation_label: string | null;
  shelter: string[];
  tags: string[];
  access_level: BeachAccess;
  image_path: string | null;
  image_alt: string | null;
  image_credit: string | null;
  image_license: string | null;
  latitude: number | string;
  longitude: number | string;
  services: string[];
  warnings: string[];
  facts: string[];
  publication_status?: PublicationStatus | null;
  updated_at?: string | null;
};

export type DataSourceRow = {
  id: string;
  slug: string;
  quality: SourceQuality;
};

export type BeachConditionRow = {
  beach_id: string;
  source_id: string;
  observed_at: string;
  forecast_at: string;
  wind_direction_degrees: number | string;
  wind_speed_kmh: number | string;
  gust_speed_kmh: number | string;
  wave_height_meters: number | string | null;
  wave_direction_degrees: number | string | null;
  weather: ForecastPoint["weather"];
  weather_code: number | string | null;
  temperature_celsius: number | string;
  apparent_temperature_celsius: number | string | null;
  water_temperature_celsius: number | string | null;
  cloud_cover_percent: number | string | null;
  precipitation_probability_percent: number | string | null;
};

export type ForecastReadStore = {
  getPublishedBeaches(scope?: CatalogScope): Promise<BeachRow[]>;
  getPublishedBeachBySlug?(slug: string): Promise<BeachRow | null>;
  getSourceBySlug(slug: string): Promise<DataSourceRow | null>;
  getForecastRows(input: {
    sourceId: string;
    from: string;
    to: string;
    beachId?: string;
    beachIds?: string[];
  }): Promise<BeachConditionRow[]>;
};

export type RecommendationQuery = {
  date: string;
  period: BeachPeriod;
  intent?: UserIntent;
  now?: Date;
  scope?: CatalogScope | null;
};

export type RecommendationBySlugQuery = RecommendationQuery & {
  slug: string;
};

export type BeachForecastBundle = {
  beach: Beach;
  dataUnavailable: boolean;
  selected?: BeachRecommendation;
  morning?: BeachRecommendation;
  afternoon?: BeachRecommendation;
};

export class ForecastDataUnavailableError extends Error {
  constructor(message = "Forecast data is unavailable") {
    super(message);
    this.name = "ForecastDataUnavailableError";
  }
}

function finiteNumber(value: number | string | null, field: string) {
  if (value === null || (typeof value === "string" && value.trim() === "")) {
    throw new ForecastDataUnavailableError(`Forecast data has an invalid ${field}`);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new ForecastDataUnavailableError(`Forecast data has an invalid ${field}`);
    }

    return value;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new ForecastDataUnavailableError(`Forecast data has an invalid ${field}`);
  }

  return parsed;
}

function nullableFiniteNumber(value: number | string | null, field: string) {
  return value === null ? null : finiteNumber(value, field);
}

export function mapBeachRow(row: BeachRow): Beach {
  return {
    slug: row.slug,
    name: row.name,
    municipality: row.municipality,
    ...(row.country_code ? { countryCode: row.country_code } : {}),
    ...(row.region_code ? { regionCode: row.region_code } : {}),
    ...(row.region_name ? { regionName: row.region_name } : {}),
    ...(row.region_slug ? { regionSlug: row.region_slug } : {}),
    ...(row.province_code ? { provinceCode: row.province_code } : {}),
    ...(row.province_name ? { provinceName: row.province_name } : {}),
    coast: row.coast,
    description: row.description,
    orientationDegrees: finiteNumber(row.orientation_degrees, "beach orientation"),
    orientationLabel: row.orientation_label ?? undefined,
    shelter: row.shelter,
    tags: row.tags,
    access: row.access_level,
    image: row.image_path ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    imageCredit: row.image_credit ?? undefined,
    imageLicense: row.image_license ?? undefined,
    latitude: finiteNumber(row.latitude, "beach latitude"),
    longitude: finiteNumber(row.longitude, "beach longitude"),
    ...(row.updated_at ? { updatedAt: row.updated_at } : {}),
    services: row.services,
    warnings: row.warnings,
    facts: row.facts,
    webcam: BEACH_WEBCAMS[row.slug],
  };
}

export function mapForecastRow(
  row: BeachConditionRow,
  sourceQuality: SourceQuality,
): ForecastPoint {
  return {
    beachId: row.beach_id,
    sourceId: row.source_id,
    observedAt: row.observed_at,
    forecastAt: row.forecast_at,
    sourceQuality,
    windDirectionDegrees: finiteNumber(row.wind_direction_degrees, "wind direction"),
    windSpeedKmh: finiteNumber(row.wind_speed_kmh, "wind speed"),
    gustSpeedKmh: finiteNumber(row.gust_speed_kmh, "gust speed"),
    waveHeightMeters: nullableFiniteNumber(row.wave_height_meters, "wave height"),
    waveDirectionDegrees: nullableFiniteNumber(row.wave_direction_degrees, "wave direction"),
    weather: row.weather,
    weatherCode: finiteNumber(row.weather_code, "weather code"),
    temperatureCelsius: finiteNumber(row.temperature_celsius, "temperature"),
    apparentTemperatureCelsius: finiteNumber(
      row.apparent_temperature_celsius,
      "apparent temperature",
    ),
    waterTemperatureCelsius: nullableFiniteNumber(
      row.water_temperature_celsius,
      "water temperature",
    ),
    cloudCoverPercent: finiteNumber(row.cloud_cover_percent, "cloud cover"),
    precipitationProbabilityPercent: finiteNumber(
      row.precipitation_probability_percent,
      "precipitation probability",
    ),
  };
}

function forecastWindow(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new ForecastDataUnavailableError("The requested forecast date is invalid");
  }

  const day = 24 * 60 * 60 * 1000;

  return {
    from: new Date(parsed.getTime() - day).toISOString(),
    to: new Date(parsed.getTime() + day).toISOString(),
  };
}

async function resolveStore(store: ForecastReadStore | undefined) {
  if (store) return store;

  const { createSupabaseForecastReadStore } = await import("../lib/supabase/server");
  return createSupabaseForecastReadStore();
}

async function loadSourceAndRows(
  store: ForecastReadStore,
  date: string,
  options: { beachId?: string; beachIds?: string[] } = {},
) {
  const source = await store.getSourceBySlug("open-meteo");

  if (!source) {
    throw new ForecastDataUnavailableError("Open-Meteo forecast source is unavailable");
  }

  const rows = await loadRowsForSource(store, source, date, options);

  return { source, rows };
}

async function loadRowsForSource(
  store: ForecastReadStore,
  source: DataSourceRow,
  date: string,
  options: { beachId?: string; beachIds?: string[] } = {},
) {
  if (options.beachIds?.length === 0) return [];

  const window = forecastWindow(date);
  const rows = await store.getForecastRows({
    sourceId: source.id,
    ...window,
    ...(options.beachId ? { beachId: options.beachId } : {}),
    ...(options.beachIds ? { beachIds: options.beachIds } : {}),
  });

  return rows;
}

function recommendationFor(
  beach: Beach,
  points: ForecastPoint[],
  query: RecommendationQuery,
  period: BeachPeriod,
  now: Date,
) {
  const conditions = aggregateForecast(points, { date: query.date, period });

  return conditions
    ? scoreBeach(beach, conditions, { intent: query.intent ?? "relax", now })
    : undefined;
}

async function fetchRecommendationsInternal(
  date: string,
  period: BeachPeriod,
  intent: UserIntent = "relax",
  scope?: CatalogScope,
) {
  const store = await resolveStore(undefined);
  const beachRows = await store.getPublishedBeaches(scope);
  const sourceAndRows = await loadSourceAndRows(
    store,
    date,
    scope ? { beachIds: beachRows.map((row) => row.id) } : {},
  );
  const beaches = beachRows.map(mapBeachRow);
  const pointsByBeachId = new Map<string, ForecastPoint[]>();

  sourceAndRows.rows.forEach((row) => {
    const points = pointsByBeachId.get(row.beach_id) ?? [];
    points.push(mapForecastRow(row, sourceAndRows.source.quality));
    pointsByBeachId.set(row.beach_id, points);
  });

  const now = new Date();

  return beachRows
    .map((row, index) =>
      recommendationFor(
        beaches[index],
        pointsByBeachId.get(row.id) ?? [],
        { date, period, intent },
        period,
        now,
      ),
    )
    .filter((recommendation): recommendation is BeachRecommendation => recommendation !== undefined)
    .sort((left, right) => right.score - left.score);
}

const getCachedRecommendations = unstable_cache(
  fetchRecommendationsInternal,
  ["beach-recommendations-cache-v1"],
  { revalidate: 300, tags: ["beach-forecast", "beach-catalog"] },
);

export async function getBeachRecommendations(
  query: RecommendationQuery,
  providedStore?: ForecastReadStore,
) {
  if (query.scope === null) return [];

  if (providedStore || query.now) {
    const store = await resolveStore(providedStore);
    const beachRows = await store.getPublishedBeaches(query.scope);
    const sourceAndRows = await loadSourceAndRows(
      store,
      query.date,
      query.scope ? { beachIds: beachRows.map((row) => row.id) } : {},
    );
    const beaches = beachRows.map(mapBeachRow);
    const pointsByBeachId = new Map<string, ForecastPoint[]>();

    sourceAndRows.rows.forEach((row) => {
      const points = pointsByBeachId.get(row.beach_id) ?? [];
      points.push(mapForecastRow(row, sourceAndRows.source.quality));
      pointsByBeachId.set(row.beach_id, points);
    });

    const now = query.now ?? new Date();

    return beachRows
      .map((row, index) =>
        recommendationFor(
          beaches[index],
          pointsByBeachId.get(row.id) ?? [],
          query,
          query.period,
          now,
        ),
      )
      .filter((recommendation): recommendation is BeachRecommendation => recommendation !== undefined)
      .sort((left, right) => right.score - left.score);
  }

  return getCachedRecommendations(
    query.date,
    query.period,
    query.intent ?? "relax",
    query.scope,
  );
}

async function fetchBeachForecastBundleInternal(
  slug: string,
  date: string,
  period: BeachPeriod,
  intent: UserIntent = "relax",
) {
  const store = await resolveStore(undefined);
  const sourcePromise = store.getSourceBySlug("open-meteo").then(
    (source) => ({ ok: true as const, source }),
    (error: unknown) => ({ ok: false as const, error }),
  );
  const beachRow = store.getPublishedBeachBySlug
    ? await store.getPublishedBeachBySlug(slug)
    : (await store.getPublishedBeaches()).find((row) => row.slug === slug) ?? null;

  if (!beachRow) return null;

  const beach = mapBeachRow(beachRow);

  try {
    const sourceResult = await sourcePromise;

    if (!sourceResult.ok) throw sourceResult.error;

    const source = sourceResult.source;

    if (!source) {
      throw new ForecastDataUnavailableError("Open-Meteo forecast source is unavailable");
    }

    const rows = await loadRowsForSource(store, source, date, { beachId: beachRow.id });
    const points = rows.map((row) => mapForecastRow(row, source.quality));
    const now = new Date();
    const query = { slug, date, period, intent };
    const selected = recommendationFor(beach, points, query, period, now);

    return {
      beach,
      dataUnavailable: !selected,
      selected,
      morning: recommendationFor(beach, points, query, "morning", now),
      afternoon: recommendationFor(beach, points, query, "afternoon", now),
    };
  } catch (error) {
    if (error instanceof ForecastDataUnavailableError) {
      return {
        beach,
        dataUnavailable: true,
      };
    }

    throw error;
  }
}

const getCachedBeachForecastBundle = unstable_cache(
  fetchBeachForecastBundleInternal,
  ["beach-forecast-bundle-cache-v1"],
  { revalidate: 300, tags: ["beach-forecast", "beach-catalog"] },
);

export async function getBeachForecastBundleBySlug(
  query: RecommendationBySlugQuery,
  providedStore?: ForecastReadStore,
): Promise<BeachForecastBundle | null> {
  if (providedStore || query.now) {
    const store = await resolveStore(providedStore);
    const sourcePromise = store.getSourceBySlug("open-meteo").then(
      (source) => ({ ok: true as const, source }),
      (error: unknown) => ({ ok: false as const, error }),
    );
    const beachRow = store.getPublishedBeachBySlug
      ? await store.getPublishedBeachBySlug(query.slug)
      : (await store.getPublishedBeaches()).find((row) => row.slug === query.slug) ?? null;

    if (!beachRow) return null;

    const beach = mapBeachRow(beachRow);

    try {
      const sourceResult = await sourcePromise;

      if (!sourceResult.ok) throw sourceResult.error;

      const source = sourceResult.source;

      if (!source) {
        throw new ForecastDataUnavailableError("Open-Meteo forecast source is unavailable");
      }

      const rows = await loadRowsForSource(store, source, query.date, { beachId: beachRow.id });
      const points = rows.map((row) => mapForecastRow(row, source.quality));
      const now = query.now ?? new Date();
      const selected = recommendationFor(beach, points, query, query.period, now);

      return {
        beach,
        dataUnavailable: !selected,
        selected,
        morning: recommendationFor(beach, points, query, "morning", now),
        afternoon: recommendationFor(beach, points, query, "afternoon", now),
      };
    } catch (error) {
      if (error instanceof ForecastDataUnavailableError) {
        return {
          beach,
          dataUnavailable: true,
        };
      }

      throw error;
    }
  }

  return getCachedBeachForecastBundle(query.slug, query.date, query.period, query.intent ?? "relax");
}

export async function getBeachBySlug(
  slug: string,
  providedStore?: ForecastReadStore,
): Promise<Beach | null> {
  const store = await resolveStore(providedStore);
  const beachRow = store.getPublishedBeachBySlug
    ? await store.getPublishedBeachBySlug(slug)
    : (await store.getPublishedBeaches()).find((row) => row.slug === slug) ?? null;

  return beachRow ? mapBeachRow(beachRow) : null;
}

async function fetchAllPublishedBeachesInternal() {
  const store = await resolveStore(undefined);
  const beachRows = await store.getPublishedBeaches();
  return beachRows.map(mapBeachRow);
}

const getCachedAllPublishedBeaches = unstable_cache(
  fetchAllPublishedBeachesInternal,
  ["all-published-beaches-cache-v1"],
  { revalidate: 3600, tags: ["beach-catalog"] },
);

export async function getAllPublishedBeaches(
  providedStore?: ForecastReadStore,
): Promise<Beach[]> {
  if (providedStore) {
    const store = await resolveStore(providedStore);
    const beachRows = await store.getPublishedBeaches();
    return beachRows.map(mapBeachRow);
  }

  return getCachedAllPublishedBeaches();
}
