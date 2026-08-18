import type { BeachConditions, BeachPeriod, BeachRecommendation } from "./beach";

export type BeachAiComment = {
  context: string;
  text: string;
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

const PERIOD_LABELS: Record<BeachPeriod, string> = {
  "all-day": "Tutto il giorno",
  morning: "Mattina",
  afternoon: "Pomeriggio",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  weekday: "long",
});

function directionName(degrees: number) {
  return WIND_NAMES[Math.round((degrees % 360) / 45) % WIND_NAMES.length];
}

function dateLabel(date: string | undefined) {
  if (!date) return "Giornata selezionata";

  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return "Giornata selezionata";

  const formatted = DATE_FORMATTER.format(parsed);
  return `${formatted.slice(0, 1).toUpperCase()}${formatted.slice(1)}`;
}

function periodLabel(period: BeachPeriod | undefined) {
  return period ? PERIOD_LABELS[period] : PERIOD_LABELS["all-day"];
}

function weatherLabel(weather: BeachConditions["weather"]) {
  switch (weather) {
    case "sereno":
      return "Cielo sereno";
    case "poco nuvoloso":
      return "Cielo poco nuvoloso";
    case "nuvoloso":
      return "Cielo nuvoloso";
    case "pioggia":
      return "Possibilità di pioggia";
  }
}

function windLabel(speedKmh: number) {
  if (speedKmh <= 8) return "vento leggero";
  if (speedKmh <= 14) return "vento moderato";
  return "vento sostenuto";
}

function seaStateFor(conditions: BeachConditions) {
  if (conditions.seaState) return conditions.seaState;
  if (conditions.waveHeightMeters >= 0.8) return "agitato" as const;
  if (conditions.waveHeightMeters >= 0.45) return "mosso" as const;
  return "calmo" as const;
}

function seaLabel(conditions: BeachConditions) {
  return `mare ${seaStateFor(conditions)}`;
}

function recommendationLabel(score: number, weather: BeachConditions["weather"]) {
  if (weather === "pioggia") return "una giornata da valutare";
  if (score >= 80) return "una scelta molto solida";
  if (score >= 65) return "una buona scelta";
  if (score >= 45) return "una spiaggia da valutare";
  return "una giornata poco favorevole";
}

export function getBeachAiComment({ beach, conditions, score }: BeachRecommendation): BeachAiComment {
  const windName = directionName(conditions.windDirectionDegrees);
  const sheltered = beach.shelter.includes(windName);
  const opening = `Per questa giornata, ${beach.name} è ${recommendationLabel(score, conditions.weather)}: ${weatherLabel(conditions.weather)}, ${windLabel(conditions.windSpeedKmh)} e ${seaLabel(conditions)}.`;
  const exposure = sheltered
    ? `È riparata dal ${windName}, quindi le condizioni restano favorevoli per stare al mare.`
    : `È esposta al ${windName}, quindi il vento si farà sentire durante la giornata.`;
  const weatherAdvice =
    conditions.weather === "pioggia"
      ? "Con la pioggia possibile, meglio partire con un piano flessibile."
      : "Nel complesso, il meteo sostiene la giornata al mare.";

  return {
    context: `${dateLabel(conditions.date)} · ${periodLabel(conditions.period)}`,
    text: `${opening} ${exposure} ${weatherAdvice}`,
  };
}
