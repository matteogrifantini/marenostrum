import type { BeachConditions, SourceQuality } from "./beach";

export type ForecastPoint = {
  beachId: string;
  sourceId: string;
  observedAt: string;
  forecastAt: string;
  sourceQuality: SourceQuality;
  windDirectionDegrees: number;
  windSpeedKmh: number;
  gustSpeedKmh: number;
  waveHeightMeters: number | null;
  waveDirectionDegrees: number | null;
  weather: BeachConditions["weather"];
  weatherCode: number;
  temperatureCelsius: number;
  apparentTemperatureCelsius: number;
  waterTemperatureCelsius: number | null;
  cloudCoverPercent: number;
  precipitationProbabilityPercent: number;
};
