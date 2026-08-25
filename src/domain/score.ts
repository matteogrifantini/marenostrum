import type {
  Beach,
  BeachConditions,
  BeachRecommendation,
  ScoreConfidence,
  UserIntent,
} from "./beach";
import { formatWindWithArticle } from "./wind-grammar";

type ScoreProfile = {
  // Kept in the profile for API compatibility; intent and beach metadata do
  // not contribute to the numeric rating.
  intent: UserIntent;
  now: Date;
};

const WIND_NAMES = [
  "tramontana",
  "grecale",
  "levante",
  "scirocco",
  "ostro",
  "libeccio",
  "ponente",
  "maestrale",
] as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function formatScoreOutOf100(score: number) {
  return Math.round(clamp(score, 0, 100)).toString();
}

function windNameFromDegrees(degrees: number) {
  const index = Math.round((degrees % 360) / 45) % WIND_NAMES.length;
  return WIND_NAMES[index];
}

function freshnessHours(conditions: BeachConditions, now: Date) {
  return Math.max(
    0,
    (now.getTime() - new Date(conditions.observedAt).getTime()) / 3_600_000,
  );
}

function confidenceFor(
  hours: number,
  quality: BeachConditions["sourceQuality"],
): ScoreConfidence {
  if (hours > 24 || quality === "low") return "bassa";
  if (hours > 8 || quality === "medium") return "media";
  return "alta";
}

function labelFor(score: number) {
  if (score >= 80) return "Ottima scelta";
  if (score >= 65) return "Buona scelta";
  if (score >= 45) return "Da valutare";
  return "Meglio cercare altrove";
}

/**
 * Calcola la differenza angolare minima (0° - 180°) tra due direzioni in gradi.
 */
function angularDifference(deg1: number, deg2: number): number {
  return Math.abs((deg1 - deg2 + 180) % 360 - 180);
}

export function scoreBeach(
  beach: Beach,
  conditions: BeachConditions,
  profile: ScoreProfile,
): BeachRecommendation {
  const windName = windNameFromDegrees(conditions.windDirectionDegrees);
  const shelteredFromWindName = beach.shelter.includes(windName);

  // 1. VENTO & ESPOSIZIONE (Max 45 punti base)
  const orientation = beach.orientationDegrees ?? 0;
  const windAngleDiff = angularDifference(conditions.windDirectionDegrees, orientation);
  const isOffshoreWind = windAngleDiff > 110;
  const isOnshoreWind = windAngleDiff < 50;

  let windImpactMultiplier = 1.0;
  if (shelteredFromWindName && isOffshoreWind) {
    windImpactMultiplier = 0.38;
  } else if (shelteredFromWindName || isOffshoreWind) {
    windImpactMultiplier = 0.55;
  } else if (isOnshoreWind) {
    windImpactMultiplier = 1.25;
  }

  const baseWindPenalty =
    Math.max(0, conditions.windSpeedKmh - 10) * 1.5 +
    Math.max(0, conditions.gustSpeedKmh - 18) * 0.5;
  const effectiveWindPenalty = clamp(baseWindPenalty * windImpactMultiplier, 0, 45);
  const windScore = clamp(45 - effectiveWindPenalty, 0, 45);

  // 2. COMFORT TERMICO & ACQUA (Max 15 punti base)
  const temp = conditions.feelsLikeCelsius ?? conditions.temperatureCelsius;
  let airComfort: number;
  if (temp >= 24 && temp <= 32) {
    airComfort = 10;
  } else if (temp > 32) {
    airComfort = clamp(10 - (temp - 32) * 0.7, 5, 10);
  } else {
    airComfort = clamp(10 - (24 - temp) * 0.85, 1, 10);
  }

  let waterComfort = 5;
  if (conditions.waterTemperatureCelsius !== undefined) {
    if (conditions.waterTemperatureCelsius >= 23) {
      waterComfort = 5;
    } else if (conditions.waterTemperatureCelsius >= 20) {
      waterComfort = 4;
    } else if (conditions.waterTemperatureCelsius >= 18) {
      waterComfort = 2.5;
    } else {
      waterComfort = 1;
    }
  }
  const thermalScore = clamp(airComfort + waterComfort, 0, 15);

  // Condizioni a terra (vento + comfort termico + 40 quota mare = 100 pt max)
  const landConditionsBase = windScore + thermalScore + 40;

  // 3. MOTO ONDOSO & STATO DEL MARE (Fattore continuo da 0.20 a 1.0)
  let effectiveWaveHeight = conditions.waveHeightMeters;
  if (conditions.waveDirectionDegrees !== undefined) {
    const waveAngleDiff = angularDifference(conditions.waveDirectionDegrees, orientation);
    if (waveAngleDiff > 110) {
      effectiveWaveHeight *= 0.65;
    }
  } else if (shelteredFromWindName || isOffshoreWind) {
    effectiveWaveHeight *= 0.78;
  }

  let seaFactor: number;
  if (effectiveWaveHeight <= 0.22) {
    seaFactor = 1.0;
  } else if (effectiveWaveHeight <= 0.45) {
    seaFactor = 1.0 - ((effectiveWaveHeight - 0.22) / 0.23) * 0.15; // 0.85 - 1.0
  } else if (effectiveWaveHeight <= 0.75) {
    seaFactor = 0.85 - ((effectiveWaveHeight - 0.45) / 0.30) * 0.38; // 0.47 - 0.85
  } else if (effectiveWaveHeight <= 1.10) {
    seaFactor = 0.47 - ((effectiveWaveHeight - 0.75) / 0.35) * 0.27; // 0.20 - 0.47
  } else {
    seaFactor = clamp(0.20 - (effectiveWaveHeight - 1.10) * 0.15, 0.08, 0.20);
  }

  if (conditions.seaState === "agitato") {
    seaFactor = Math.min(seaFactor, 0.35);
  }

  // 4. METEO & NUVOLOSITÀ (Fattore continuo da 0.30 a 1.0)
  const cloud = conditions.cloudCoverPercent ?? (conditions.weather === "nuvoloso" ? 80 : conditions.weather === "poco nuvoloso" ? 35 : 5);
  let weatherFactor: number;
  if (conditions.weather === "pioggia") {
    weatherFactor = 0.32;
  } else if (conditions.weather === "nuvoloso" || cloud >= 65) {
    weatherFactor = clamp(0.72 - ((cloud - 65) / 35) * 0.16, 0.52, 0.72);
  } else if (conditions.weather === "poco nuvoloso" || cloud >= 25) {
    weatherFactor = clamp(0.95 - ((cloud - 25) / 40) * 0.10, 0.85, 0.95);
  } else {
    weatherFactor = clamp(1.0 - (cloud / 25) * 0.03, 0.97, 1.0);
  }

  // Penalità fluida progressiva per probabilità di pioggia
  let rainFactor = 1.0;
  if (conditions.precipitationProbabilityPercent !== undefined && conditions.precipitationProbabilityPercent > 10) {
    const rainRatio = clamp(conditions.precipitationProbabilityPercent / 100, 0, 1);
    rainFactor = clamp(1.0 - Math.pow(rainRatio, 0.95) * 0.88, 0.12, 1.0);
  }

  // 5. CALCOLO FINALE DELLO SCORE CONTINUO
  const rawScore = landConditionsBase * seaFactor * weatherFactor * rainFactor;
  const score = Math.round(clamp(rawScore, 0, 100));
  const hours = freshnessHours(conditions, profile.now);
  const confidence = confidenceFor(hours, conditions.sourceQuality);
  const freshnessReason = hours > 24 ? "Controlla l’ultimo aggiornamento prima di partire." : "";
  const shelterReason = shelteredFromWindName
    ? `È riparata ${formatWindWithArticle(windName, "shelter")}.`
    : `È esposta ${formatWindWithArticle(windName, "exposure")}.`;
  const reason = [shelterReason, freshnessReason].filter(Boolean).join(" ");

  return {
    beach,
    conditions,
    score,
    label: labelFor(score),
    reason,
    confidence,
    factors: {
      wind: Math.round((windScore / 40) * 100),
      sea: Math.round(seaFactor * 100),
      weather: Math.round(weatherFactor * rainFactor * 100),
    },
  };
}
