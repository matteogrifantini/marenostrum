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

function recommendationVerdict(score: number, weather: BeachConditions["weather"]) {
  if (weather === "pioggia") return "una giornata sconsigliata per la balneazione";
  if (weather === "nuvoloso") return score >= 60 ? "una scelta discreta ma con cielo coperto" : "una giornata poco favorevole";
  if (score >= 80) return "una scelta eccellente";
  if (score >= 65) return "una buona scelta";
  if (score >= 45) return "una spiaggia da valutare con cautela";
  return "una giornata poco favorevole";
}

function buildAdviceSummary(score: number, conditions: BeachConditions, sheltered: boolean) {
  if (conditions.weather === "pioggia") {
    return "Con pioggia prevista, la balneazione è sconsigliata: meglio organizzare un piano alternativo.";
  }
  if (conditions.weather === "nuvoloso") {
    return "Il cielo coperto limita il soleggiamento, ma le acque possono essere piacevoli per una passeggiata o una sosta breve.";
  }
  if (score >= 80) {
    return "Condizioni ideali: cielo limpido, mare calmo e clima perfetto per trascorrere la giornata in riva al mare.";
  }
  if (score >= 65) {
    return "Le condizioni sono complessivamente favorevoli per godersi la spiaggia.";
  }
  if (score >= 45) {
    return sheltered
      ? "Il vento è presente ma la conformazione della cala offre riparo; valuta le condizioni all'arrivo."
      : "L'esposizione al vento o il mare mosso consigliano cautela se cerchi acque tranquille per il bagno.";
  }
  return "Il moto ondoso o il vento contrario rendono la spiaggia poco adatta al relax; consigliabile optare per un versante più riparato.";
}

export function getBeachAiComment({ beach, conditions, score }: BeachRecommendation): BeachAiComment {
  const windName = directionName(conditions.windDirectionDegrees);
  const sheltered = beach.shelter.includes(windName);
  const opening = `Per questa giornata, ${beach.name} è ${recommendationVerdict(score, conditions.weather)}: ${weatherLabel(conditions.weather)}, ${windLabel(conditions.windSpeedKmh)} e ${seaLabel(conditions)}.`;
  const exposure = sheltered
    ? `È riparata ${formatWindWithArticle(windName, "shelter")}, riducendo l'impatto delle raffiche.`
    : `È esposta ${formatWindWithArticle(windName, "exposure")}, quindi il vento si farà sentire durante la giornata.`;
  const advice = buildAdviceSummary(score, conditions, sheltered);

  return {
    context: `${dateLabel(conditions.date)} · ${periodLabel(conditions.period)}`,
    text: `${opening} ${exposure} ${advice}`,
  };
}
