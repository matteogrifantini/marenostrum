import { useSyncExternalStore } from "react";

export type LanguagePreference = "it";
export type DistanceUnit = "km" | "mi";
export type TemperatureUnit = "celsius" | "fahrenheit";
export type WaveHeightUnit = "meters" | "feet";

export type UserPreferences = {
  language: LanguagePreference;
  distanceUnit: DistanceUnit;
  temperatureUnit: TemperatureUnit;
  waveHeightUnit: WaveHeightUnit;
};

export const USER_PREFERENCES_STORAGE_KEY = "marenostrum:preferences:v1";

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: "it",
  distanceUnit: "km",
  temperatureUnit: "celsius",
  waveHeightUnit: "meters",
};

const PREFERENCES_EVENT = "marenostrum:preferences:changed";

function isDistanceUnit(value: unknown): value is DistanceUnit {
  return value === "km" || value === "mi";
}

function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return value === "celsius" || value === "fahrenheit";
}

function isWaveHeightUnit(value: unknown): value is WaveHeightUnit {
  return value === "meters" || value === "feet";
}

export function parseUserPreferences(value: string | null): UserPreferences {
  if (!value) return DEFAULT_USER_PREFERENCES;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return DEFAULT_USER_PREFERENCES;

    const candidate = parsed as Record<string, unknown>;
    return {
      language: "it",
      distanceUnit: isDistanceUnit(candidate.distanceUnit)
        ? candidate.distanceUnit
        : DEFAULT_USER_PREFERENCES.distanceUnit,
      temperatureUnit: isTemperatureUnit(candidate.temperatureUnit)
        ? candidate.temperatureUnit
        : DEFAULT_USER_PREFERENCES.temperatureUnit,
      waveHeightUnit: isWaveHeightUnit(candidate.waveHeightUnit)
        ? candidate.waveHeightUnit
        : DEFAULT_USER_PREFERENCES.waveHeightUnit,
    };
  } catch {
    return DEFAULT_USER_PREFERENCES;
  }
}

let cachedStorageValue: string | null | undefined;
let cachedPreferences = DEFAULT_USER_PREFERENCES;

function currentStorageValue() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readUserPreferences() {
  const raw = currentStorageValue();
  if (raw === cachedStorageValue) return cachedPreferences;

  cachedStorageValue = raw;
  cachedPreferences = parseUserPreferences(raw);
  return cachedPreferences;
}

export function writeUserPreferences(next: UserPreferences) {
  const normalized: UserPreferences = {
    language: "it",
    distanceUnit: isDistanceUnit(next.distanceUnit)
      ? next.distanceUnit
      : DEFAULT_USER_PREFERENCES.distanceUnit,
    temperatureUnit: isTemperatureUnit(next.temperatureUnit)
      ? next.temperatureUnit
      : DEFAULT_USER_PREFERENCES.temperatureUnit,
    waveHeightUnit: isWaveHeightUnit(next.waveHeightUnit)
      ? next.waveHeightUnit
      : DEFAULT_USER_PREFERENCES.waveHeightUnit,
  };
  const serialized = JSON.stringify(normalized);

  cachedStorageValue = serialized;
  cachedPreferences = normalized;

  try {
    window.localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, serialized);
    window.dispatchEvent(new Event(PREFERENCES_EVENT));
  } catch {
    // Preferences are an enhancement; keep the in-memory value if storage is blocked.
  }
}

export function subscribeToUserPreferences(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleChange = () => onChange();
  window.addEventListener("storage", handleChange);
  window.addEventListener(PREFERENCES_EVENT, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(PREFERENCES_EVENT, handleChange);
  };
}

export function useUserPreferences() {
  return useSyncExternalStore(
    subscribeToUserPreferences,
    readUserPreferences,
    () => DEFAULT_USER_PREFERENCES,
  );
}

function formatDecimal(value: number) {
  return Number(value.toFixed(1)).toString();
}

export function formatDistanceKm(valueKm: number, unit: DistanceUnit) {
  const value = unit === "mi" ? valueKm * 0.621371 : valueKm;
  return `${formatDecimal(value)} ${unit}`;
}

export function formatWindSpeedKmh(valueKmh: number, unit: DistanceUnit) {
  const value = unit === "mi" ? valueKmh * 0.621371 : valueKmh;
  return `${formatDecimal(value)} ${unit === "mi" ? "mph" : "km/h"}`;
}

export function formatTemperatureCelsius(valueCelsius: number, unit: TemperatureUnit) {
  const value = unit === "fahrenheit" ? (valueCelsius * 9) / 5 + 32 : valueCelsius;
  return `${formatDecimal(value)}°${unit === "fahrenheit" ? "F" : "C"}`;
}

export function formatWaveHeightMeters(valueMeters: number, unit: WaveHeightUnit) {
  const value = unit === "feet" ? valueMeters * 3.28084 : valueMeters;
  return `${formatDecimal(value)} ${unit === "feet" ? "ft" : "m"}`;
}
