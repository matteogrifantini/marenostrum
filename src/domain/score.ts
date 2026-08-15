import type {
  Beach,
  BeachConditions,
  BeachRecommendation,
  ScoreConfidence,
  UserIntent,
} from "./beach";

type ScoreProfile = {
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

const WEATHER_PENALTIES: Record<BeachConditions["weather"], number> = {
  sereno: 0,
  "poco nuvoloso": 3,
  nuvoloso: 10,
  pioggia: 22,
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
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

function intentFit(beach: Beach, intent: UserIntent) {
  const tagMap: Record<UserIntent, string[]> = {
    relax: ["relax", "tranquilla"],
    family: ["famiglie", "acque-basse"],
    explore: ["selvaggia", "panorama"],
    "water-sport": ["snorkeling", "sport-acqua"],
  };

  return tagMap[intent].some((tag) => beach.tags.includes(tag)) ? 5 : 0;
}

export function scoreBeach(
  beach: Beach,
  conditions: BeachConditions,
  profile: ScoreProfile,
): BeachRecommendation {
  const windName = windNameFromDegrees(conditions.windDirectionDegrees);
  const sheltered = beach.shelter.includes(windName);
  const windPenalty = clamp(
    Math.max(0, conditions.windSpeedKmh - 10) * 1.4 +
      Math.max(0, conditions.gustSpeedKmh - 18) * 0.35,
    0,
    35,
  );
  const windScore = clamp(35 - windPenalty + (sheltered ? 10 : 0), 0, 45);
  const seaScore = clamp(25 - conditions.waveHeightMeters * 16, 0, 25);
  const weatherScore = clamp(20 - WEATHER_PENALTIES[conditions.weather], 0, 20);
  const accessScore = { facile: 10, moderato: 7, difficile: 4 }[beach.access];
  const fitScore = intentFit(beach, profile.intent);
  const score = Math.round(
    clamp(windScore + seaScore + weatherScore + accessScore + fitScore, 0, 100),
  );
  const hours = freshnessHours(conditions, profile.now);
  const confidence = confidenceFor(hours, conditions.sourceQuality);
  const freshnessReason = hours > 24 ? "Controlla l’ultimo aggiornamento prima di partire." : "";
  const shelterReason = sheltered
    ? `È riparata dal ${windName}.`
    : `È esposta al ${windName}.`;
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
      access: accessScore,
      fit: fitScore,
    },
  };
}
