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

  // 3. MOTO ONDOSO & STATO DEL MARE (Fattore continuo e rigoroso per la balneabilità)
  let effectiveWaveHeight = conditions.waveHeightMeters;
  if (conditions.waveDirectionDegrees !== undefined) {
    const waveAngleDiff = angularDifference(conditions.waveDirectionDegrees, orientation);
    if (waveAngleDiff > 110) {
      effectiveWaveHeight *= 0.75;
    }
  } else if (shelteredFromWindName && isOffshoreWind) {
    effectiveWaveHeight *= 0.85;
  }

  let seaFactor: number;
  if (effectiveWaveHeight <= 0.20) {
    seaFactor = 1.0;
  } else if (effectiveWaveHeight <= 0.35) {
    // 0.20m - 0.35m: mare quasi calmo (0.85 - 1.0)
    seaFactor = 1.0 - ((effectiveWaveHeight - 0.20) / 0.15) * 0.15;
  } else if (effectiveWaveHeight <= 0.55) {
    // 0.35m - 0.55m: mare poco mosso/mosso (0.55 - 0.85)
    seaFactor = 0.85 - ((effectiveWaveHeight - 0.35) / 0.20) * 0.30;
  } else if (effectiveWaveHeight <= 0.85) {
    // 0.55m - 0.85m: mare mosso evidente (0.30 - 0.55)
    seaFactor = 0.55 - ((effectiveWaveHeight - 0.55) / 0.30) * 0.25;
  } else if (effectiveWaveHeight <= 1.20) {
    // 0.85m - 1.20m: mare agitato (0.15 - 0.30)
    seaFactor = 0.30 - ((effectiveWaveHeight - 0.85) / 0.35) * 0.15;
  } else {
    // > 1.20m: mare molto agitato (0.05 - 0.15)
    seaFactor = clamp(0.15 - (effectiveWaveHeight - 1.20) * 0.10, 0.05, 0.15);
  }

  const isSeaMosso = conditions.seaState === "mosso" || conditions.waveHeightMeters >= 0.45;
  const isSeaAgitato = conditions.seaState === "agitato" || conditions.waveHeightMeters >= 0.80;

  if (isSeaAgitato) {
    seaFactor = Math.min(seaFactor, 0.28);
  } else if (isSeaMosso) {
    seaFactor = Math.min(seaFactor, 0.58);
  }

  // 4. METEO & NUVOLOSITÀ (Fattore continuo da 0.20 a 1.0)
  const cloud = conditions.cloudCoverPercent ?? (conditions.weather === "pioggia" ? 100 : conditions.weather === "nuvoloso" ? 85 : conditions.weather === "poco nuvoloso" ? 40 : 5);
  let weatherFactor: number;
  if (conditions.weather === "pioggia") {
    weatherFactor = 0.25;
  } else if (conditions.weather === "nuvoloso" || cloud >= 70) {
    // Cielo nuvoloso / molto coperto (0.45 - 0.65)
    weatherFactor = clamp(0.65 - ((cloud - 70) / 30) * 0.20, 0.45, 0.65);
  } else if (conditions.weather === "poco nuvoloso" || cloud >= 25) {
    // Poco nuvoloso / nubi sparse (0.80 - 0.95)
    weatherFactor = clamp(0.95 - ((cloud - 25) / 45) * 0.15, 0.80, 0.95);
  } else {
    // Sereno / sole pieno (0.96 - 1.0)
    weatherFactor = clamp(1.0 - (cloud / 25) * 0.04, 0.96, 1.0);
  }

  // Penalità fluida progressiva per probabilità di pioggia
  let rainFactor = 1.0;
  if (conditions.precipitationProbabilityPercent !== undefined && conditions.precipitationProbabilityPercent > 10) {
    const rainRatio = clamp(conditions.precipitationProbabilityPercent / 100, 0, 1);
    rainFactor = clamp(1.0 - Math.pow(rainRatio, 0.9) * 0.85, 0.10, 1.0);
  }

  // 5. CALCOLO FINALE DELLO SCORE CONTINUO E TETTI MASSIMI RIGOROSI
  let rawScore = landConditionsBase * seaFactor * weatherFactor * rainFactor;

  if (conditions.weather === "pioggia" || (conditions.precipitationProbabilityPercent ?? 0) >= 60) {
    rawScore = Math.min(rawScore, 35);
  } else if (isSeaAgitato) {
    rawScore = Math.min(rawScore, 40);
  } else if (isSeaMosso && (conditions.weather === "nuvoloso" || cloud >= 70)) {
    // Sia mare mosso CHE cielo nuvoloso: punteggio nettamente penalizzato (max 48, arancione/rosso)
    rawScore = Math.min(rawScore, 48);
  } else if (isSeaMosso) {
    // Solo mare mosso: massimo 64 (Da valutare, mai "Ottima scelta")
    rawScore = Math.min(rawScore, 64);
  } else if (conditions.weather === "nuvoloso" || cloud >= 70) {
    // Solo cielo nuvoloso: massimo 68 (Da valutare/Buona, mai "Ottima scelta")
    rawScore = Math.min(rawScore, 68);
  }

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
