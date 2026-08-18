import type { BeachRecommendation } from "./beach";

export type BeachSignalTone = "sea" | "sun" | "warning";

export type BeachSignal = {
  label: string;
  tone: BeachSignalTone;
};

function getWeatherSignal(weather: BeachRecommendation["conditions"]["weather"]): BeachSignal {
  switch (weather) {
    case "sereno":
      return { label: "Cielo sereno", tone: "sea" };
    case "poco nuvoloso":
      return { label: "Poco nuvoloso", tone: "sun" };
    case "nuvoloso":
      return { label: "Cielo nuvoloso", tone: "sun" };
    case "pioggia":
      return { label: "Pioggia possibile", tone: "warning" };
  }
}

function getSeaSignal(seaState: BeachRecommendation["conditions"]["seaState"]): BeachSignal | null {
  switch (seaState) {
    case "calmo":
      return { label: "Mare calmo", tone: "sea" };
    case "mosso":
      return { label: "Mare mosso", tone: "sun" };
    case "agitato":
      return { label: "Mare agitato", tone: "warning" };
    default:
      return null;
  }
}

function getParkingSignal(recommendation: BeachRecommendation): BeachSignal | null {
  const { beach } = recommendation;
  const hasParkingWarning = beach.warnings?.some((warning) => /parcheggio/i.test(warning));

  if (hasParkingWarning) {
    return { label: "Parcheggio limitato", tone: "warning" };
  }

  const hasParkingService = beach.services?.some((service) => /parcheggio/i.test(service));

  if (hasParkingService) {
    return { label: "Parcheggio disponibile", tone: "sea" };
  }

  return null;
}

export function getBeachLiveSignals(recommendation: BeachRecommendation): BeachSignal[] {
  return [
    getWeatherSignal(recommendation.conditions.weather),
    getSeaSignal(recommendation.conditions.seaState),
    getParkingSignal(recommendation),
  ].filter((signal): signal is BeachSignal => signal !== null);
}
