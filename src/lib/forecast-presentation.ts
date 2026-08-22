import type { BeachConditions } from "../domain/beach";

export function formatAggregateMetric(value: number) {
  return Number(value.toFixed(1)).toString();
}

export function formatWeatherLabel(weather: BeachConditions["weather"]) {
  switch (weather) {
    case "sereno":
      return "Sereno";
    case "poco nuvoloso":
      return "Poco nuvoloso";
    case "nuvoloso":
      return "Nuvoloso";
    case "pioggia":
      return "Pioggia";
  }
}
