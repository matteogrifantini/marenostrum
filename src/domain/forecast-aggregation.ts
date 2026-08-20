import type { BeachConditions, BeachPeriod, SourceQuality } from "./beach";
import type { ForecastPoint } from "./forecast";

const TIME_ZONE = "Europe/Rome";
const WEATHER_SEVERITY: Record<BeachConditions["weather"], number> = {
  sereno: 0,
  "poco nuvoloso": 1,
  nuvoloso: 2,
  pioggia: 3,
};
const SOURCE_QUALITY_SEVERITY: Record<SourceQuality, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

type LocalForecastPoint = {
  point: ForecastPoint;
  date: string;
  hour: number;
  minute: number;
};

function localForecastPoint(point: ForecastPoint): LocalForecastPoint | undefined {
  const forecastAt = new Date(point.forecastAt);

  if (Number.isNaN(forecastAt.getTime())) return undefined;

  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: TIME_ZONE,
    year: "numeric",
  }).formatToParts(forecastAt);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    point,
    date: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function periodWindow(period: BeachPeriod): [number, number] {
  if (period === "morning") return [8, 12];
  if (period === "afternoon") return [13, 18];
  return [8, 18];
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function finiteValues(values: Array<number | null>) {
  return values.filter((value): value is number => value !== null && Number.isFinite(value));
}

function meanNullable(values: Array<number | null>) {
  const usable = finiteValues(values);
  return usable.length > 0 ? mean(usable) : undefined;
}

function max(values: number[]) {
  return Math.max(...values);
}

function mostSevereWeather(points: ForecastPoint[]): BeachConditions["weather"] {
  return points.reduce((severe, point) =>
    WEATHER_SEVERITY[point.weather] > WEATHER_SEVERITY[severe] ? point.weather : severe,
  points[0].weather);
}

function worstSourceQuality(points: ForecastPoint[]): SourceQuality {
  return points.reduce((worst, point) =>
    SOURCE_QUALITY_SEVERITY[point.sourceQuality] > SOURCE_QUALITY_SEVERITY[worst]
      ? point.sourceQuality
      : worst,
  points[0].sourceQuality);
}

function seaStateFor(waveHeightMeters: number): BeachConditions["seaState"] {
  if (waveHeightMeters >= 0.8) return "agitato";
  if (waveHeightMeters >= 0.45) return "mosso";
  return "calmo";
}

export function circularMeanDegrees(values: number[]): number {
  const vectors = values.map((degrees) => degrees * Math.PI / 180);
  const x = vectors.reduce((sum, value) => sum + Math.cos(value), 0);
  const y = vectors.reduce((sum, value) => sum + Math.sin(value), 0);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export function aggregateForecast(
  points: ForecastPoint[],
  options: { date: string; period: BeachPeriod },
): BeachConditions | undefined {
  const [startHour, endHour] = periodWindow(options.period);
  const selected = points
    .map(localForecastPoint)
    .filter((value): value is LocalForecastPoint => value !== undefined)
    .filter(
      ({ date, hour }) =>
        date === options.date && hour >= startHour && hour <= endHour,
    )
    .sort((left, right) => left.point.forecastAt.localeCompare(right.point.forecastAt));

  if (selected.length === 0) return undefined;

  const wavePoints = selected.filter(
    ({ point }) => point.waveHeightMeters !== null && Number.isFinite(point.waveHeightMeters),
  );

  if (wavePoints.length === 0) return undefined;

  const selectedPoints = selected.map(({ point }) => point);
  const waveHeights = wavePoints.map(({ point }) => point.waveHeightMeters as number);
  const waveDirections = wavePoints
    .map(({ point }) => point.waveDirectionDegrees)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const waterTemperature = meanNullable(
    selectedPoints.map((point) => point.waterTemperatureCelsius),
  );
  const timeline = selected
    .filter(({ hour }) => hour % 2 === 0)
    .filter(({ point }) => point.waveHeightMeters !== null && Number.isFinite(point.waveHeightMeters))
    .map(({ point, hour, minute }) => ({
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      windSpeedKmh: point.windSpeedKmh,
      gustSpeedKmh: point.gustSpeedKmh,
      waveHeightMeters: point.waveHeightMeters as number,
      temperatureCelsius: point.temperatureCelsius,
      cloudCoverPercent: point.cloudCoverPercent,
      precipitationProbabilityPercent: point.precipitationProbabilityPercent,
      ...(point.waveDirectionDegrees !== null && {
        waveDirectionDegrees: point.waveDirectionDegrees,
      }),
      windDirectionDegrees: point.windDirectionDegrees,
      ...(point.waterTemperatureCelsius !== null && {
        waterTemperatureCelsius: point.waterTemperatureCelsius,
      }),
      weather: point.weather,
    }));
  const waveHeightMeters = max(waveHeights);

  return {
    observedAt: selectedPoints[0].observedAt,
    sourceQuality: worstSourceQuality(selectedPoints),
    windDirectionDegrees: circularMeanDegrees(
      selectedPoints.map((point) => point.windDirectionDegrees),
    ),
    windSpeedKmh: mean(selectedPoints.map((point) => point.windSpeedKmh)),
    gustSpeedKmh: max(selectedPoints.map((point) => point.gustSpeedKmh)),
    waveHeightMeters,
    weather: mostSevereWeather(selectedPoints),
    temperatureCelsius: mean(selectedPoints.map((point) => point.temperatureCelsius)),
    date: options.date,
    period: options.period,
    feelsLikeCelsius: mean(
      selectedPoints.map((point) => point.apparentTemperatureCelsius),
    ),
    ...(waterTemperature !== undefined && { waterTemperatureCelsius: waterTemperature }),
    precipitationProbabilityPercent: max(
      selectedPoints.map((point) => point.precipitationProbabilityPercent),
    ),
    ...(waveDirections.length > 0 && {
      waveDirectionDegrees: circularMeanDegrees(waveDirections),
    }),
    cloudCoverPercent: mean(selectedPoints.map((point) => point.cloudCoverPercent)),
    seaState: seaStateFor(waveHeightMeters),
    hourly: timeline,
  };
}
