import { describe, expect, it } from "vitest";

import type {
  BeachConditionRow,
  BeachRow,
  DataSourceRow,
  ForecastReadStore,
} from "./beach-repository";
import {
  ForecastDataUnavailableError,
  getAllPublishedBeaches,
  getBeachBySlug,
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
  scopeCalls: Parameters<ForecastReadStore["getPublishedBeaches"]>[0][] = [];
  forecastInputs: Parameters<ForecastReadStore["getForecastRows"]>[0][] = [];

  constructor(
    private readonly beaches: BeachRow[],
    private readonly source: DataSourceRow | null,
    private readonly rows: ReturnType<typeof conditionRow>[],
  ) {}

  async getPublishedBeaches(scope?: Parameters<ForecastReadStore["getPublishedBeaches"]>[0]) {
    this.scopeCalls.push(scope);
    return this.beaches;
  }

  async getSourceBySlug(slug: string) {
    return slug === "open-meteo" ? this.source : null;
  }

  async getForecastRows(input: Parameters<ForecastReadStore["getForecastRows"]>[0]) {
    this.forecastInputs.push(input);
    return this.rows.filter(
      (row) =>
        row.source_id === input.sourceId &&
        row.forecast_at >= input.from &&
        row.forecast_at < input.to &&
        (input.beachId === undefined || row.beach_id === input.beachId) &&
        (input.beachIds === undefined || input.beachIds.includes(row.beach_id)),
    );
  }
}

it("passes a province scope to the beach read and bounds the forecast read to its beach ids", async () => {
  const store = new FakeForecastReadStore(
    [beachRow, vendicariRow],
    sourceRow,
    [conditionRow(beachRow.id), conditionRow(vendicariRow.id)],
  );
  const scope = { kind: "province", provinceCode: "PA" } as const;

  await getBeachRecommendations(
    {
      date: "2026-08-20",
      period: "all-day",
      scope,
      now: new Date("2026-08-20T10:00:00Z"),
    },
    store,
  );

  expect(store.scopeCalls).toEqual([scope]);
  expect(store.forecastInputs[0]?.beachIds).toEqual([beachRow.id, vendicariRow.id]);
});

it("uses a direct published beach lookup when the forecast store provides one", async () => {
  let listCalls = 0;
  const store: ForecastReadStore = {
    getPublishedBeaches: async () => {
      listCalls += 1;
      return [];
    },
    getPublishedBeachBySlug: async () => beachRow,
    getSourceBySlug: async () => sourceRow,
    getForecastRows: async () => [conditionRow(beachRow.id)],
  };

  await expect(getBeachForecastBundleBySlug({
    slug: beachRow.slug,
    date: "2026-08-20",
    period: "all-day",
  }, store)).resolves.toMatchObject({ beach: { slug: beachRow.slug } });
  expect(listCalls).toBe(0);
});

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

  it("keeps the national geography fields when mapping a beach row", () => {
    const rowWithGeography = {
      ...beachRow,
      country_code: "IT",
      region_code: "IT-82",
      region_name: "Sicilia",
      region_slug: "sicilia",
      province_code: "PA",
      province_name: "Palermo",
      updated_at: "2026-09-03T08:00:00Z",
    } as BeachRow;

    expect(mapBeachRow(rowWithGeography)).toMatchObject({
      countryCode: "IT",
      regionCode: "IT-82",
      regionName: "Sicilia",
      regionSlug: "sicilia",
      provinceCode: "PA",
      provinceName: "Palermo",
      updatedAt: "2026-09-03T08:00:00Z",
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

  it("passes a validated catalog scope and its beach ids to the forecast read", async () => {
    let receivedScope: unknown;
    let receivedBeachIds: string[] | undefined;
    const store: ForecastReadStore = {
      getPublishedBeaches: async (scope) => {
        receivedScope = scope;
        return [beachRow];
      },
      getSourceBySlug: async () => sourceRow,
      getForecastRows: async (input) => {
        receivedBeachIds = input.beachIds;
        return [conditionRow(beachRow.id)];
      },
    };

    await getBeachRecommendations(
      {
        date: "2026-08-20",
        period: "morning",
        now: new Date("2026-08-20T09:00:00Z"),
        scope: { kind: "province", provinceCode: "PA" },
      },
      store,
    );

    expect(receivedScope).toEqual({ kind: "province", provinceCode: "PA" });
    expect(receivedBeachIds).toEqual([beachRow.id]);
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

  it("does not leak a parallel source failure for an unknown beach slug", async () => {
    const store: ForecastReadStore = {
      getPublishedBeaches: async () => [],
      getSourceBySlug: async () => {
        throw new ForecastDataUnavailableError("Source unavailable");
      },
      getForecastRows: async () => [],
    };

    await expect(
      getBeachForecastBundleBySlug(
        { slug: "sconosciuta", date: "2026-08-20", period: "all-day" },
        store,
      ),
    ).resolves.toBeNull();
  });

  it("does not leak a parallel source failure when the catalog fails", async () => {
    const store: ForecastReadStore = {
      getPublishedBeaches: async () => {
        throw new ForecastDataUnavailableError("Catalog unavailable");
      },
      getSourceBySlug: () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new ForecastDataUnavailableError("Source unavailable")), 10);
        }),
      getForecastRows: async () => [],
    };

    await expect(
      getBeachForecastBundleBySlug(
        { slug: beachRow.slug, date: "2026-08-20", period: "all-day" },
        store,
      ),
    ).rejects.toBeInstanceOf(ForecastDataUnavailableError);
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  it("starts the forecast source read while the published beach catalog is pending", async () => {
    let releaseBeaches!: (rows: BeachRow[]) => void;
    let sourceReadStarted = false;
    const beachesPromise = new Promise<BeachRow[]>((resolve) => {
      releaseBeaches = resolve;
    });
    const store: ForecastReadStore = {
      getPublishedBeaches: () => beachesPromise,
      getSourceBySlug: async () => {
        sourceReadStarted = true;
        return sourceRow;
      },
      getForecastRows: async ({ beachId }) => [conditionRow(beachId ?? beachRow.id)],
    };

    const bundlePromise = getBeachForecastBundleBySlug(
      { slug: beachRow.slug, date: "2026-08-20", period: "all-day" },
      store,
    );
    await Promise.resolve();
    await Promise.resolve();
    const sourceReadStartedBeforeCatalog = sourceReadStarted;

    releaseBeaches([beachRow]);
    await bundlePromise;

    expect(sourceReadStartedBeforeCatalog).toBe(true);
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

  it("retrieves a beach by slug directly from published beaches", async () => {
    const store = new FakeForecastReadStore([beachRow, vendicariRow], sourceRow, []);

    await expect(getBeachBySlug("cala-del-gelsomino", store)).resolves.toEqual(
      mapBeachRow(beachRow),
    );
    await expect(getBeachBySlug("non-esistente", store)).resolves.toBeNull();
  });

  it("retrieves all published beaches mapped into domain models", async () => {
    const store = new FakeForecastReadStore([beachRow, vendicariRow], sourceRow, []);

    await expect(getAllPublishedBeaches(store)).resolves.toEqual([
      mapBeachRow(beachRow),
      mapBeachRow(vendicariRow),
    ]);
  });
});
