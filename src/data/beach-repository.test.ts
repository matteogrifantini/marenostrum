import { describe, expect, it } from "vitest";

import type {
  BeachConditionRow,
  BeachRow,
  DataSourceRow,
  ForecastReadStore,
} from "./beach-repository";
import {
  ForecastDataUnavailableError,
  getBeachForecastBundleBySlug,
  getBeachRecommendations,
  mapBeachRow,
  mapForecastRow,
} from "./beach-repository";

const beachRow: BeachRow = {
  id: "beach-gelsomino",
  slug: "cala-del-gelsomino",
  name: "Cala del Gelsomino",
  municipality: "Noto",
  coast: "Sud-est",
  description: "Una baia riparata per un bagno tranquillo.",
  orientation_degrees: "120",
  orientation_label: "Sud-est",
  shelter: ["maestrale", "ponente"],
  tags: ["relax", "famiglie"],
  access_level: "facile",
  image_path: "/images/beaches/cala-del-gelsomino.jpg",
  image_alt: "La cala vista dalla pineta.",
  image_credit: "Stella",
  image_license: "CC BY-SA 4.0",
  latitude: "36.9436",
  longitude: "15.1953",
  services: ["Parcheggio vicino", "Bar stagionale", "Pineta"],
  warnings: ["Il parcheggio può riempirsi."],
  facts: ["Fondale basso"],
};

const vendicariRow: BeachRow = {
  ...beachRow,
  id: "beach-vendicari",
  slug: "tonnara-di-vendicari",
  name: "Tonnara di Vendicari",
  shelter: [],
  tags: ["esplora"],
  access_level: "moderato",
};

const sourceRow: DataSourceRow = {
  id: "open-meteo-source",
  slug: "open-meteo",
  quality: "high",
};

const invalidRequiredForecastNumbers: Array<[
  string,
  BeachConditionRow["weather_code"],
]> = [
  ["null", null],
  ["an empty string", ""],
  ["a whitespace-only string", "   "],
  ["NaN", Number.NaN],
  ["Infinity", Number.POSITIVE_INFINITY],
  ["a NaN string", "NaN"],
  ["an Infinity string", "Infinity"],
];

function conditionRow(
  beachId: string,
  overrides: Partial<BeachConditionRow> = {},
): BeachConditionRow {
  return {
    beach_id: beachId,
    source_id: "open-meteo-source",
    observed_at: "2026-08-20T05:00:00Z",
    forecast_at: "2026-08-20T08:00:00+02:00",
    wind_direction_degrees: "315",
    wind_speed_kmh: "9",
    gust_speed_kmh: "14",
    wave_height_meters: "0.3",
    wave_direction_degrees: "300",
    weather: "sereno",
    weather_code: 0,
    temperature_celsius: "29",
    apparent_temperature_celsius: "30",
    water_temperature_celsius: "26",
    cloud_cover_percent: "8",
    precipitation_probability_percent: "0",
    ...overrides,
  };
}

class FakeForecastReadStore implements ForecastReadStore {
  constructor(
    private readonly beaches: BeachRow[],
    private readonly source: DataSourceRow | null,
    private readonly rows: ReturnType<typeof conditionRow>[],
  ) {}

  async getPublishedBeaches() {
    return this.beaches;
  }

  async getSourceBySlug(slug: string) {
    return slug === "open-meteo" ? this.source : null;
  }

  async getForecastRows(input: {
    sourceId: string;
    from: string;
    to: string;
    beachId?: string;
  }) {
    return this.rows.filter(
      (row) =>
        row.source_id === input.sourceId &&
        row.forecast_at >= input.from &&
        row.forecast_at < input.to &&
        (input.beachId === undefined || row.beach_id === input.beachId),
    );
  }
}

describe("Supabase forecast repository", () => {
  it("maps snake_case beach metadata and numeric strings into a Beach", () => {
    expect(mapBeachRow(beachRow)).toMatchObject({
      slug: "cala-del-gelsomino",
      image: "/images/beaches/cala-del-gelsomino.jpg",
      latitude: 36.9436,
      longitude: 15.1953,
      services: ["Parcheggio vicino", "Bar stagionale", "Pineta"],
    });
  });

  it("maps snake_case forecast values into finite numeric points", () => {
    expect(mapForecastRow(conditionRow(beachRow.id), "high")).toMatchObject({
      beachId: "beach-gelsomino",
      forecastAt: "2026-08-20T08:00:00+02:00",
      windSpeedKmh: 9,
      waveHeightMeters: 0.3,
      precipitationProbabilityPercent: 0,
    });
  });

  it.each(invalidRequiredForecastNumbers)("rejects %s for a required forecast number", (_description, value) => {
    expect(() =>
      mapForecastRow(
        conditionRow(beachRow.id, {
          weather_code: value,
        }),
        "high",
      ),
    ).toThrow(ForecastDataUnavailableError);
  });

  it("preserves null marine values", () => {
    expect(
      mapForecastRow(
        conditionRow(beachRow.id, {
          wave_height_meters: null,
          wave_direction_degrees: null,
          water_temperature_celsius: null,
        }),
        "high",
      ),
    ).toMatchObject({
      waveHeightMeters: null,
      waveDirectionDegrees: null,
      waterTemperatureCelsius: null,
    });
  });

  it("aggregates, scores, and sorts recommendations for the requested Rome date", async () => {
    const store = new FakeForecastReadStore(
      [beachRow, vendicariRow],
      sourceRow,
      [
        conditionRow(beachRow.id),
        conditionRow(vendicariRow.id, {
          wind_speed_kmh: "22",
          gust_speed_kmh: "30",
          wave_height_meters: "1.2",
        }),
        conditionRow(beachRow.id, {
          forecast_at: "2026-08-19T21:00:00Z",
          wind_speed_kmh: "40",
          wave_height_meters: "2",
        }),
      ],
    );

    const recommendations = await getBeachRecommendations(
      {
        date: "2026-08-20",
        period: "all-day",
        intent: "relax",
        now: new Date("2026-08-20T09:00:00Z"),
      },
      store,
    );

    expect(recommendations.map((recommendation) => recommendation.beach.slug)).toEqual([
      "cala-del-gelsomino",
      "tonnara-di-vendicari",
    ]);
    expect(recommendations[0].conditions.waveHeightMeters).toBe(0.3);
  });

  it("returns no recommendations when the selected window has no forecast rows", async () => {
    const store = new FakeForecastReadStore([beachRow], sourceRow, []);

    await expect(
      getBeachRecommendations(
        { date: "2026-08-20", period: "morning" },
        store,
      ),
    ).resolves.toEqual([]);
  });

  it("reports a recoverable error when the Open-Meteo source is missing", async () => {
    const store = new FakeForecastReadStore([beachRow], null, []);

    await expect(
      getBeachRecommendations(
        { date: "2026-08-20", period: "morning" },
        store,
      ),
    ).rejects.toBeInstanceOf(ForecastDataUnavailableError);
  });

  it("reports a recoverable error instead of zero-filling incomplete forecast rows", async () => {
    const store = new FakeForecastReadStore(
      [beachRow],
      sourceRow,
      [conditionRow(beachRow.id, { weather_code: null })],
    );

    await expect(
      getBeachRecommendations(
        { date: "2026-08-20", period: "morning" },
        store,
      ),
    ).rejects.toBeInstanceOf(ForecastDataUnavailableError);
  });

  it("returns null for an unknown beach slug", async () => {
    const store = new FakeForecastReadStore([beachRow], sourceRow, []);

    await expect(
      getBeachForecastBundleBySlug(
        { slug: "sconosciuta", date: "2026-08-20", period: "all-day" },
        store,
      ),
    ).resolves.toBeNull();
  });

  it("keeps a known beach distinct from its missing forecast", async () => {
    const store = new FakeForecastReadStore([beachRow], sourceRow, []);

    await expect(
      getBeachForecastBundleBySlug(
        { slug: beachRow.slug, date: "2026-08-20", period: "all-day" },
        store,
      ),
    ).resolves.toEqual({
      beach: mapBeachRow(beachRow),
      dataUnavailable: true,
      selected: undefined,
      morning: undefined,
      afternoon: undefined,
    });
  });

  it("keeps a published beach available when its forecast source is unavailable", async () => {
    const store = new FakeForecastReadStore([beachRow], null, []);

    await expect(
      getBeachForecastBundleBySlug(
        { slug: beachRow.slug, date: "2026-08-20", period: "all-day" },
        store,
      ),
    ).resolves.toEqual({
      beach: mapBeachRow(beachRow),
      dataUnavailable: true,
      selected: undefined,
      morning: undefined,
      afternoon: undefined,
    });
  });
});
