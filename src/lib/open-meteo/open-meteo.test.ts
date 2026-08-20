import { describe, expect, it, vi } from "vitest";

import {
  buildOpenMeteoUrls,
  fetchOpenMeteoForecasts,
  mapWmoWeatherCode,
  OpenMeteoPayloadError,
} from "./open-meteo";

const beaches = [
  { id: "b1", latitude: 36.9436, longitude: 15.1953 },
  { id: "b2", latitude: 36.8078, longitude: 15.0984 },
];

const timestamps = [1787205600, 1787227200];

function weatherPayload() {
  return [
    {
      hourly: {
        time: timestamps,
        temperature_2m: [27.1, 27.8],
        apparent_temperature: [28.3, 29.1],
        precipitation_probability: [5, 0],
        weather_code: [2, 0],
        cloud_cover: [22, 8],
        wind_speed_10m: [9, 11],
        wind_direction_10m: [120, 135],
        wind_gusts_10m: [17, 19],
      },
    },
    {
      hourly: {
        time: timestamps,
        temperature_2m: [24.2, 24.8],
        apparent_temperature: [25.1, 25.7],
        precipitation_probability: [10, 15],
        weather_code: [3, 61],
        cloud_cover: [46, 82],
        wind_speed_10m: [12, 14],
        wind_direction_10m: [210, 225],
        wind_gusts_10m: [22, 25],
      },
    },
  ];
}

function marinePayload() {
  return [
    {
      hourly: {
        time: [timestamps[1], timestamps[0]],
        wave_height: [null, 0.3],
        wave_direction: [null, 150],
        sea_surface_temperature: [null, 25.2],
      },
    },
    {
      hourly: {
        time: [timestamps[1], timestamps[0]],
        wave_height: [0.4, 0.8],
        wave_direction: [170, 160],
        sea_surface_temperature: [24.3, 24.5],
      },
    },
  ];
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function createFetcher(weather: unknown, marine: unknown) {
  return vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = new URL(
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
    );
    return url.hostname === "api.open-meteo.com"
      ? response(weather)
      : response(marine);
  });
}

describe("mapWmoWeatherCode", () => {
  it("maps Open-Meteo WMO codes to the beach weather vocabulary", () => {
    expect(mapWmoWeatherCode(0)).toBe("sereno");
    expect(mapWmoWeatherCode(2)).toBe("poco nuvoloso");
    expect(mapWmoWeatherCode(45)).toBe("nuvoloso");
    expect(mapWmoWeatherCode(63)).toBe("pioggia");
  });
});

describe("buildOpenMeteoUrls", () => {
  it("batches beach coordinates into the required weather and marine requests", () => {
    const urls = buildOpenMeteoUrls([
      { id: "b1", latitude: 36.9436, longitude: 15.1953 },
      { id: "b2", latitude: 36.8078, longitude: 15.0984 },
    ]);

    expect(urls.weather.searchParams.get("latitude")).toBe("36.9436,36.8078");
    expect(urls.weather.searchParams.get("forecast_days")).toBe("4");
    expect(urls.weather.searchParams.get("timezone")).toBe("Europe/Rome,Europe/Rome");
    expect(urls.weather.searchParams.get("timeformat")).toBe("unixtime");
    expect(urls.marine.searchParams.get("cell_selection")).toBe("sea");
  });
});

describe("fetchOpenMeteoForecasts", () => {
  it("merges batched weather and marine data by location and timestamp", async () => {
    const fetcher = createFetcher(weatherPayload(), marinePayload());

    const points = await fetchOpenMeteoForecasts(beaches, {
      sourceId: "open-meteo-source",
      observedAt: new Date("2026-08-20T05:00:00.000Z"),
      fetcher,
    });

    expect(points).toHaveLength(4);
    expect(points[0]).toMatchObject({
      beachId: "b1",
      sourceId: "open-meteo-source",
      observedAt: "2026-08-20T05:00:00.000Z",
      forecastAt: "2026-08-20T06:00:00.000Z",
      windSpeedKmh: 9,
      gustSpeedKmh: 17,
      waveHeightMeters: 0.3,
      waterTemperatureCelsius: 25.2,
      precipitationProbabilityPercent: 5,
    });
    expect(points[1]).toMatchObject({
      beachId: "b1",
      forecastAt: "2026-08-20T12:00:00.000Z",
      waveHeightMeters: null,
      waterTemperatureCelsius: null,
    });
    expect(points[2]).toMatchObject({
      beachId: "b2",
      forecastAt: "2026-08-20T06:00:00.000Z",
      waveHeightMeters: 0.8,
      waterTemperatureCelsius: 24.5,
    });
    const urls = buildOpenMeteoUrls(beaches);
    expect(fetcher.mock.calls[0]?.[0]).toBeInstanceOf(URL);
    expect((fetcher.mock.calls[0]?.[0] as URL).href).toBe(urls.weather.href);
    expect(fetcher.mock.calls[0]?.[1]).toEqual({ cache: "no-store" });
    expect(fetcher.mock.calls[1]?.[0]).toBeInstanceOf(URL);
    expect((fetcher.mock.calls[1]?.[0] as URL).href).toBe(urls.marine.href);
    expect(fetcher.mock.calls[1]?.[1]).toEqual({ cache: "no-store" });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("normalizes singleton weather and marine payloads", async () => {
    const [beach] = beaches;
    const fetcher = createFetcher(weatherPayload()[0], marinePayload()[0]);

    const points = await fetchOpenMeteoForecasts([beach], {
      sourceId: "open-meteo-source",
      fetcher,
    });

    expect(points).toHaveLength(2);
    expect(points[0]).toMatchObject({
      beachId: "b1",
      forecastAt: "2026-08-20T06:00:00.000Z",
      waveHeightMeters: 0.3,
      waterTemperatureCelsius: 25.2,
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("rejects a response with a different number of locations", async () => {
    await expect(
      fetchOpenMeteoForecasts(beaches, {
        sourceId: "open-meteo-source",
        fetcher: createFetcher([weatherPayload()[0]], marinePayload()),
      }),
    ).rejects.toBeInstanceOf(OpenMeteoPayloadError);
  });

  it("rejects mismatched hourly array lengths before returning points", async () => {
    const invalidWeather = weatherPayload();
    invalidWeather[1].hourly.wind_speed_10m = [11];

    await expect(
      fetchOpenMeteoForecasts(beaches, {
        sourceId: "open-meteo-source",
        fetcher: createFetcher(invalidWeather, marinePayload()),
      }),
    ).rejects.toBeInstanceOf(OpenMeteoPayloadError);
  });

  it.each([
    ["weather", response({ reason: "unavailable" }, 503), response(marinePayload())],
    ["marine", response(weatherPayload()), response({ reason: "unavailable" }, 503)],
  ])("rejects the whole batch when the %s request is not successful", async (_kind, weather, marine) => {
    const fetcher = createFetcher(weather, marine);

    await expect(
      fetchOpenMeteoForecasts(beaches, {
        sourceId: "open-meteo-source",
        fetcher,
      }),
    ).rejects.toBeInstanceOf(OpenMeteoPayloadError);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
