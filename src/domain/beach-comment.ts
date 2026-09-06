import type { BeachConditions, BeachPeriod, BeachRecommendation } from "./beach";
import { formatWindWithArticle } from "./wind-grammar";

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
  if (speedKmh <= 15) return "vento moderato";
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

function buildAdviceSummary(score: number, conditions: BeachConditions, sheltered: boolean) {
  if (conditions.weather === "pioggia") {
    return "Con pioggia prevista, la balneazione è sconsigliata: meglio organizzare un piano alternativo.";
  }
  if (conditions.weather === "nuvoloso") {
    return "Cielo coperto: temperatura piacevole, ma cielo coperto con minore soleggiamento sul litorale.";
  }
  if (score >= 80) {
    return "Condizioni ottimali: mare limpido e calmo, ideale per nuotare e sostare in spiaggia.";
  }
  if (score >= 65) {
    return "Condizioni favorevoli per godersi la spiaggia.";
  }
  if (score >= 45) {
    return sheltered
      ? "Vento presente ma baia protetta: balneabile valutando le condizioni all'arrivo."
      : "Mare mosso o vento teso: prestare attenzione se cerchi acque calme per il bagno.";
  }
  return "Mare agitato o vento contrario: balneazione sconsigliata, preferibile spostarsi su un versante riparato.";
}

export function getBeachAiComment({ beach, conditions, score }: BeachRecommendation): BeachAiComment {
  const windName = directionName(conditions.windDirectionDegrees);
  const sheltered = beach.shelter.includes(windName);
  const opening = `${beach.name}: ${weatherLabel(conditions.weather)}, ${windLabel(conditions.windSpeedKmh)} e ${seaLabel(conditions)}.`;
  const exposure = sheltered
    ? `È riparata ${formatWindWithArticle(windName, "shelter")}, riducendo l'impatto del vento.`
    : `È esposta ${formatWindWithArticle(windName, "exposure")}, con vento diretto sulla riva.`;
  const advice = buildAdviceSummary(score, conditions, sheltered);

  return {
    context: `${dateLabel(conditions.date)} · ${periodLabel(conditions.period)}`,
    text: `${opening} ${exposure} ${advice}`,
  };
}
