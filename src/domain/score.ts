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

  // 1. VENTO & RIPARO (Max 35 punti)
  // Calcolo dell'angolo di incidenza del vento rispetto all'orientamento verso il mare della spiaggia:
  // - > 110°: vento da terra (off-shore), spiana il mare e l'effetto a riva è protetto dalla costa/falesia
  // - < 50°: vento dal mare (on-shore), increspa l'acqua e crea risacca
  const orientation = beach.orientationDegrees ?? 0;
  const windAngleDiff = angularDifference(conditions.windDirectionDegrees, orientation);
  const isOffshoreWind = windAngleDiff > 110;
  const isOnshoreWind = windAngleDiff < 50;

  // Moltiplicatore di esposizione al vento:
  // Se la spiaggia è esplicitamente riparata dal vento o il vento è off-shore, l'impatto a riva è ridotto.
  let windImpactMultiplier = 1.0;
  if (shelteredFromWindName && isOffshoreWind) {
    windImpactMultiplier = 0.45;
  } else if (shelteredFromWindName || isOffshoreWind) {
    windImpactMultiplier = 0.60;
  } else if (isOnshoreWind) {
    windImpactMultiplier = 1.20;
  }

  const baseWindPenalty =
    Math.max(0, conditions.windSpeedKmh - 10) * 1.35 +
    Math.max(0, conditions.gustSpeedKmh - 18) * 0.45;
  const effectiveWindPenalty = clamp(baseWindPenalty * windImpactMultiplier, 0, 35);
  const windScore = clamp(35 - effectiveWindPenalty, 0, 35);

  // 2. MOTO ONDOSO & STATO DEL MARE (Max 30 punti)
  // Se la direzione d'onda è disponibile ed è off-shore (dietro la costa), l'altezza a riva è smorzata
  let effectiveWaveHeight = conditions.waveHeightMeters;
  if (conditions.waveDirectionDegrees !== undefined) {
    const waveAngleDiff = angularDifference(conditions.waveDirectionDegrees, orientation);
    if (waveAngleDiff > 110) {
      effectiveWaveHeight *= 0.65;
    }
  } else if (shelteredFromWindName || isOffshoreWind) {
    effectiveWaveHeight *= 0.80;
  }

  let seaScore: number;
  if (effectiveWaveHeight <= 0.20) {
    seaScore = 30;
  } else if (effectiveWaveHeight <= 0.40) {
    seaScore = 30 - ((effectiveWaveHeight - 0.20) / 0.20) * 4;
  } else if (effectiveWaveHeight <= 0.65) {
    seaScore = 26 - ((effectiveWaveHeight - 0.40) / 0.25) * 11;
  } else if (effectiveWaveHeight <= 0.95) {
    seaScore = 15 - ((effectiveWaveHeight - 0.65) / 0.30) * 10;
  } else {
    seaScore = clamp(5 - (effectiveWaveHeight - 0.95) * 8, 0, 5);
  }

  // 3. METEO, SOLEGGIAMENTO & RISCHIO PIOGGIA (Max 20 punti)
  let weatherBase: number;
  switch (conditions.weather) {
    case "sereno":
      weatherBase = 20;
      break;
    case "poco nuvoloso":
      weatherBase = 17;
      break;
    case "nuvoloso":
      weatherBase = 10;
      break;
    case "pioggia":
      weatherBase = 2;
      break;
  }

  // Modulazione fine tramite cloudCover e precipitationProbability se presenti
  if (conditions.cloudCoverPercent !== undefined) {
    if (conditions.weather === "sereno" && conditions.cloudCoverPercent > 20) {
      weatherBase -= clamp((conditions.cloudCoverPercent - 20) * 0.05, 0, 3);
    } else if (conditions.weather === "nuvoloso" && conditions.cloudCoverPercent < 60) {
      weatherBase += clamp((60 - conditions.cloudCoverPercent) * 0.08, 0, 4);
    }
  }

  if (conditions.precipitationProbabilityPercent !== undefined && conditions.precipitationProbabilityPercent > 25) {
    const rainRiskPenalty = clamp((conditions.precipitationProbabilityPercent - 25) * 0.20, 0, 12);
    weatherBase -= rainRiskPenalty;
  }
  const weatherScore = clamp(weatherBase, 0, 20);

  // 4. COMFORT TERMICO & TEMPERATURA DELL'ACQUA (Max 15 punti)
  // Comfort aria (10 pt max): ideale tra 24°C e 32°C
  const temp = conditions.feelsLikeCelsius ?? conditions.temperatureCelsius;
  let airComfort: number;
  if (temp >= 24 && temp <= 32) {
    airComfort = 10;
  } else if (temp > 32) {
    airComfort = clamp(10 - (temp - 32) * 0.7, 5, 10);
  } else {
    airComfort = clamp(10 - (24 - temp) * 0.9, 1, 10);
  }

  // Comfort acqua (5 pt max): ideale >= 23°C
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

  // SOMMA PONDERATA (Max 100 pt)
  let rawScore = Math.round(windScore + seaScore + weatherScore + thermalScore);

  // CEILING DI COERENZA E SICUREZZA
  // Pioggia o probabilità di pioggia elevata:
  if (conditions.weather === "pioggia" || (conditions.precipitationProbabilityPercent ?? 0) >= 70) {
    rawScore = Math.min(rawScore, 35);
  } else if (conditions.weather === "nuvoloso" || (conditions.cloudCoverPercent ?? 0) >= 85) {
    rawScore = Math.min(rawScore, 68);
  }

  // Mare mosso o agitato:
  if (conditions.waveHeightMeters >= 0.85 || conditions.seaState === "agitato") {
    rawScore = Math.min(rawScore, 45);
  } else if (conditions.waveHeightMeters >= 0.55 && !shelteredFromWindName && !isOffshoreWind) {
    rawScore = Math.min(rawScore, 65);
  }

  // Vento sostenuto su spiaggia esposta:
  if (conditions.windSpeedKmh >= 32 && !shelteredFromWindName && !isOffshoreWind) {
    rawScore = Math.min(rawScore, 55);
  }

  const score = clamp(rawScore, 0, 100);
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
      wind: Math.round(windScore),
      sea: Math.round(seaScore),
      weather: Math.round(weatherScore),
    },
  };
}
