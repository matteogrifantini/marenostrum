import type { BeachConditions } from "../../domain/beach";
import type { ForecastPoint } from "../../domain/forecast";

const WEATHER_VARIABLES = [
  "temperature_2m",
  "apparent_temperature",
  "precipitation_probability",
  "weather_code",
  "cloud_cover",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
] as const;

const MARINE_VARIABLES = [
  "wave_height",
  "wave_direction",
  "sea_surface_temperature",
] as const;

export type OpenMeteoBeach = {
  id: string;
  latitude: number;
  longitude: number;
};

export type FetchOpenMeteoOptions = {
  sourceId: string;
  observedAt?: Date;
  fetcher?: typeof fetch;
};

export class OpenMeteoPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenMeteoPayloadError";
  }
}

type WeatherHourly = {
  time: number[];
  temperatureCelsius: number[];
  apparentTemperatureCelsius: number[];
  precipitationProbabilityPercent: number[];
  weatherCode: number[];
  cloudCoverPercent: number[];
  windSpeedKmh: number[];
  windDirectionDegrees: number[];
  gustSpeedKmh: number[];
};

type MarineHourly = {
  time: number[];
  waveHeightMeters: Array<number | null>;
  waveDirectionDegrees: Array<number | null>;
  waterTemperatureCelsius: Array<number | null>;
};

export function mapWmoWeatherCode(code: number): BeachConditions["weather"] {
  if (code === 0) {
    return "sereno";
  }

  if (code === 1 || code === 2) {
    return "poco nuvoloso";
  }

  if (code === 3 || code === 45 || code === 48) {
    return "nuvoloso";
  }

  return "pioggia";
}

export function buildOpenMeteoUrls(beaches: OpenMeteoBeach[]) {
  const latitude = beaches.map((beach) => beach.latitude).join(",");
  const longitude = beaches.map((beach) => beach.longitude).join(",");
  const timezone = beaches.map(() => "Europe/Rome").join(",");

  const weather = new URL("https://api.open-meteo.com/v1/forecast");
  weather.searchParams.set("latitude", latitude);
  weather.searchParams.set("longitude", longitude);
  weather.searchParams.set("hourly", WEATHER_VARIABLES.join(","));
  weather.searchParams.set("forecast_days", "4");
  weather.searchParams.set("timeformat", "unixtime");
  weather.searchParams.set("wind_speed_unit", "kmh");
  weather.searchParams.set("timezone", timezone);

  const marine = new URL("https://marine-api.open-meteo.com/v1/marine");
  marine.searchParams.set("latitude", latitude);
  marine.searchParams.set("longitude", longitude);
  marine.searchParams.set("hourly", MARINE_VARIABLES.join(","));
  marine.searchParams.set("forecast_days", "4");
  marine.searchParams.set("timeformat", "unixtime");
  marine.searchParams.set("timezone", timezone);
  marine.searchParams.set("cell_selection", "sea");

  return { weather, marine };
}

function payloadError(message: string): never {
  throw new OpenMeteoPayloadError(message);
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return payloadError(`${label} must be an object`);
  }

  return value as Record<string, unknown>;
}

function requiredNumberArray(
  hourly: Record<string, unknown>,
  name: string,
  expectedLength?: number,
): number[] {
  const value = hourly[name];

  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "number" || !Number.isFinite(entry))) {
    return payloadError(`${name} must be an array of finite numbers`);
  }

  if (expectedLength !== undefined && value.length !== expectedLength) {
    return payloadError(`${name} must have ${expectedLength} entries`);
  }

  return value;
}

function nullableNumberArray(
  hourly: Record<string, unknown>,
  name: string,
  expectedLength: number,
): Array<number | null> {
  const value = hourly[name];

  if (
    !Array.isArray(value) ||
    value.length !== expectedLength ||
    value.some((entry) => entry !== null && (typeof entry !== "number" || !Number.isFinite(entry)))
  ) {
    return payloadError(`${name} must be an array of ${expectedLength} finite numbers or null values`);
  }

  return value;
}

function parseWeatherHourly(location: unknown, index: number): WeatherHourly {
  const payload = asRecord(location, `weather location ${index}`);
  const hourly = asRecord(payload.hourly, `weather location ${index}.hourly`);
  const time = requiredNumberArray(hourly, "time");

  return {
    time,
    temperatureCelsius: requiredNumberArray(hourly, "temperature_2m", time.length),
    apparentTemperatureCelsius: requiredNumberArray(hourly, "apparent_temperature", time.length),
    precipitationProbabilityPercent: requiredNumberArray(
      hourly,
      "precipitation_probability",
      time.length,
    ),
    weatherCode: requiredNumberArray(hourly, "weather_code", time.length),
    cloudCoverPercent: requiredNumberArray(hourly, "cloud_cover", time.length),
    windSpeedKmh: requiredNumberArray(hourly, "wind_speed_10m", time.length),
    windDirectionDegrees: requiredNumberArray(hourly, "wind_direction_10m", time.length),
    gustSpeedKmh: requiredNumberArray(hourly, "wind_gusts_10m", time.length),
  };
}

function parseMarineHourly(location: unknown, index: number): MarineHourly {
  const payload = asRecord(location, `marine location ${index}`);
  const hourly = asRecord(payload.hourly, `marine location ${index}.hourly`);
  const time = requiredNumberArray(hourly, "time");

  return {
    time,
    waveHeightMeters: nullableNumberArray(hourly, "wave_height", time.length),
    waveDirectionDegrees: nullableNumberArray(hourly, "wave_direction", time.length),
    waterTemperatureCelsius: nullableNumberArray(hourly, "sea_surface_temperature", time.length),
  };
}

async function parseResponse(response: Response, provider: "weather" | "marine"): Promise<unknown> {
  if (!response.ok) {
    return payloadError(`${provider} request failed with status ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    return payloadError(`${provider} response is not valid JSON`);
  }
}

function parseLocations(payload: unknown, provider: "weather" | "marine", count: number): unknown[] {
  if (count === 1 && typeof payload === "object" && payload !== null && !Array.isArray(payload)) {
    return [payload];
  }

  if (!Array.isArray(payload) || payload.length !== count) {
    return payloadError(`${provider} response must contain ${count} locations`);
  }

  return payload;
}

function toUtcIso(epochSeconds: number, label: string): string {
  try {
    return new Date(epochSeconds * 1000).toISOString();
  } catch {
    return payloadError(`${label} must be a valid Unix timestamp`);
  }
}

export async function fetchOpenMeteoForecasts(
  beaches: OpenMeteoBeach[],
  options: FetchOpenMeteoOptions,
): Promise<ForecastPoint[]> {
  if (beaches.length === 0) {
    return payloadError("at least one beach is required");
  }

  const { weather, marine } = buildOpenMeteoUrls(beaches);
  const fetcher = options.fetcher ?? fetch;
  const [weatherResponse, marineResponse] = await Promise.all([
    fetcher(weather, { cache: "no-store" }),
    fetcher(marine, { cache: "no-store" }),
  ]);
  const [weatherPayload, marinePayload] = await Promise.all([
    parseResponse(weatherResponse, "weather"),
    parseResponse(marineResponse, "marine"),
  ]);
  const weatherLocations = parseLocations(weatherPayload, "weather", beaches.length);
  const marineLocations = parseLocations(marinePayload, "marine", beaches.length);
  const weatherHours = weatherLocations.map(parseWeatherHourly);
  const marineHours = marineLocations.map(parseMarineHourly);
  const observedAt = toUtcIso(options.observedAt?.getTime() ?? Date.now(), "observedAt");

  return beaches.flatMap((beach, locationIndex) => {
    const weatherHourly = weatherHours[locationIndex];
    const marineHourly = marineHours[locationIndex];

    if (marineHourly.time.length !== weatherHourly.time.length) {
      return payloadError(`marine location ${locationIndex} has a mismatched time array length`);
    }

    const marineByTimestamp = new Map(
      marineHourly.time.map((timestamp, hourIndex) => [
        timestamp,
        {
          waveHeightMeters: marineHourly.waveHeightMeters[hourIndex],
          waveDirectionDegrees: marineHourly.waveDirectionDegrees[hourIndex],
          waterTemperatureCelsius: marineHourly.waterTemperatureCelsius[hourIndex],
        },
      ]),
    );

    if (marineByTimestamp.size !== marineHourly.time.length) {
      return payloadError(`marine location ${locationIndex} contains duplicate timestamps`);
    }

    return weatherHourly.time.map((timestamp, hourIndex) => {
      const marineValues = marineByTimestamp.get(timestamp);

      if (!marineValues) {
        return payloadError(`marine location ${locationIndex} is missing timestamp ${timestamp}`);
      }

      return {
        beachId: beach.id,
        sourceId: options.sourceId,
        observedAt,
        forecastAt: toUtcIso(timestamp, `weather location ${locationIndex}.time`),
        sourceQuality: "high",
        windDirectionDegrees: weatherHourly.windDirectionDegrees[hourIndex],
        windSpeedKmh: weatherHourly.windSpeedKmh[hourIndex],
        gustSpeedKmh: weatherHourly.gustSpeedKmh[hourIndex],
        waveHeightMeters: marineValues.waveHeightMeters,
        waveDirectionDegrees: marineValues.waveDirectionDegrees,
        weather: mapWmoWeatherCode(weatherHourly.weatherCode[hourIndex]),
        weatherCode: weatherHourly.weatherCode[hourIndex],
        temperatureCelsius: weatherHourly.temperatureCelsius[hourIndex],
        apparentTemperatureCelsius: weatherHourly.apparentTemperatureCelsius[hourIndex],
        waterTemperatureCelsius: marineValues.waterTemperatureCelsius,
        cloudCoverPercent: weatherHourly.cloudCoverPercent[hourIndex],
        precipitationProbabilityPercent: weatherHourly.precipitationProbabilityPercent[hourIndex],
      };
    });
  });
}
