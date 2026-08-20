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
import { scoreBeach } from "../domain/score";

export type BeachRow = {
  id: string;
  slug: string;
  name: string;
  municipality: string;
  coast: string;
  description: string;
  orientation_degrees: number | string;
  orientation_label: string | null;
  shelter: string[] | null;
  tags: string[] | null;
  access_level: BeachAccess;
  image_path: string | null;
  image_alt: string | null;
  image_credit: string | null;
  image_license: string | null;
  latitude: number | string;
  longitude: number | string;
  services: string[] | null;
  warnings: string[] | null;
  facts: string[] | null;
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
  getPublishedBeaches(): Promise<BeachRow[]>;
  getSourceBySlug(slug: string): Promise<DataSourceRow | null>;
  getForecastRows(input: {
    sourceId: string;
    from: string;
    to: string;
    beachId?: string;
  }): Promise<BeachConditionRow[]>;
};

export type RecommendationQuery = {
  date: string;
  period: BeachPeriod;
  intent?: UserIntent;
  now?: Date;
};

export type RecommendationBySlugQuery = RecommendationQuery & {
  slug: string;
};

export type BeachForecastBundle = {
  beach: Beach;
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

function stringList(value: string[] | null) {
  return value ?? [];
}

export function mapBeachRow(row: BeachRow): Beach {
  return {
    slug: row.slug,
    name: row.name,
    municipality: row.municipality,
    coast: row.coast,
    description: row.description,
    orientationDegrees: finiteNumber(row.orientation_degrees, "beach orientation"),
    orientationLabel: row.orientation_label ?? undefined,
    shelter: stringList(row.shelter),
    tags: stringList(row.tags),
    access: row.access_level,
    image: row.image_path ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    imageCredit: row.image_credit ?? undefined,
    imageLicense: row.image_license ?? undefined,
    latitude: finiteNumber(row.latitude, "beach latitude"),
    longitude: finiteNumber(row.longitude, "beach longitude"),
    services: stringList(row.services),
    warnings: stringList(row.warnings),
    facts: stringList(row.facts),
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
  beachId?: string,
) {
  const source = await store.getSourceBySlug("open-meteo");

  if (!source) {
    throw new ForecastDataUnavailableError("Open-Meteo forecast source is unavailable");
  }

  const window = forecastWindow(date);
  const rows = await store.getForecastRows({
    sourceId: source.id,
    ...window,
    ...(beachId ? { beachId } : {}),
  });

  return { source, rows };
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

export async function getBeachRecommendations(
  query: RecommendationQuery,
  providedStore?: ForecastReadStore,
) {
  const store = await resolveStore(providedStore);
  const [beachRows, sourceAndRows] = await Promise.all([
    store.getPublishedBeaches(),
    loadSourceAndRows(store, query.date),
  ]);
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

export async function getBeachForecastBundleBySlug(
  query: RecommendationBySlugQuery,
  providedStore?: ForecastReadStore,
): Promise<BeachForecastBundle | null> {
  const store = await resolveStore(providedStore);
  const beachRow = (await store.getPublishedBeaches()).find((row) => row.slug === query.slug);

  if (!beachRow) return null;

  const { source, rows } = await loadSourceAndRows(store, query.date, beachRow.id);
  const beach = mapBeachRow(beachRow);
  const points = rows.map((row) => mapForecastRow(row, source.quality));
  const now = query.now ?? new Date();

  return {
    beach,
    selected: recommendationFor(beach, points, query, query.period, now),
    morning: recommendationFor(beach, points, query, "morning", now),
    afternoon: recommendationFor(beach, points, query, "afternoon", now),
  };
}
