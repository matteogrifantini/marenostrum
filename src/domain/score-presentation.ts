import type { BeachRecommendation } from "./beach";
import { formatScoreOutOf100 } from "./score";

export type ScoreFactorKey = "wind" | "sea" | "weather";

export type ScoreFactor = {
  key: ScoreFactorKey;
  label: string;
  value: number;
  valueLabel: string;
};

export type ScorePresentation = {
  title: string;
  score: number;
  scoreLabel: string;
  label: string;
  explanation: string;
  disclaimer: string;
  freshnessText: string;
  factors: ScoreFactor[];
};

const FACTOR_LABELS: Array<{ key: ScoreFactorKey; label: string }> = [
  { key: "wind", label: "Vento" },
  { key: "sea", label: "Mare" },
  { key: "weather", label: "Meteo" },
];

const OBSERVATION_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
});

function publicLabel(score: number) {
  if (score >= 80) return "Ottime condizioni";
  if (score >= 65) return "Buone condizioni";
  if (score >= 45) return "Condizioni da valutare";
  return "Condizioni poco favorevoli";
}

function factorValue(value: number) {
  return Number.isFinite(value) ? Math.round(Math.min(100, Math.max(0, value))) : 0;
}

function freshnessText(recommendation: BeachRecommendation) {
  const observedAt = new Date(recommendation.conditions.observedAt);

  if (Number.isNaN(observedAt.getTime())) {
    return "Aggiornamento non disponibile.";
  }

  const formatted = OBSERVATION_FORMATTER.format(observedAt);
  const freshnessWarning = recommendation.confidence === "bassa"
    ? " · Dati non recenti: verifica le condizioni prima di partire"
    : recommendation.confidence === "media"
      ? " · Verifica l’ultimo aggiornamento prima di partire"
      : "";

  return `Ultimo aggiornamento: ${formatted}${freshnessWarning}.`;
}

export function getScorePresentation(
  recommendation: BeachRecommendation,
): ScorePresentation {
  const factors = FACTOR_LABELS.map(({ key, label }) => {
    const value = factorValue(recommendation.factors[key]);
    return {
      key,
      label,
      value,
      valueLabel: `${value}/100`,
    };
  });

  return {
    title: "Indice condizioni del mare",
    score: recommendation.score,
    scoreLabel: `${formatScoreOutOf100(recommendation.score)}/100`,
    label: publicLabel(recommendation.score),
    explanation:
      "Una sintesi di vento, onde e meteo per aiutarti a scegliere dove andare oggi.",
    disclaimer:
      "Indice orientativo · non è un bollettino ufficiale e non misura la qualità dell’acqua.",
    freshnessText: freshnessText(recommendation),
    factors,
  };
}
