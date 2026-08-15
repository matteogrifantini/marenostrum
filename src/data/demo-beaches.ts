import type { Beach, BeachConditions, UserIntent } from "../domain/beach";
import { scoreBeach } from "../domain/score";

export const DEMO_NOW = new Date("2026-08-14T09:00:00.000Z");

export const demoBeachInputs: Array<{ beach: Beach; conditions: BeachConditions }> = [
  {
    beach: {
      slug: "cala-del-gelsomino",
      name: "Cala del Gelsomino",
      municipality: "Noto",
      coast: "Sud-est",
      description: "Acqua bassa, luce aperta e una baia che resta piacevole quando gira il vento.",
      orientationDegrees: 120,
      shelter: ["maestrale", "ponente", "tramontana"],
      tags: ["relax", "famiglie", "acque-basse"],
      access: "facile",
    },
    conditions: {
      observedAt: "2026-08-14T08:00:00.000Z",
      sourceQuality: "high",
      windDirectionDegrees: 315,
      windSpeedKmh: 7,
      gustSpeedKmh: 12,
      waveHeightMeters: 0.2,
      weather: "sereno",
      temperatureCelsius: 30,
    },
  },
  {
    beach: {
      slug: "tonnara-di-vendicari",
      name: "Tonnara di Vendicari",
      municipality: "Noto",
      coast: "Sud-est",
      description: "Un tratto di costa da vivere con calma, tra sentieri, acqua trasparente e paesaggio aperto.",
      orientationDegrees: 160,
      shelter: ["maestrale", "tramontana"],
      tags: ["esplora", "selvaggia", "panorama"],
      access: "moderato",
    },
    conditions: {
      observedAt: "2026-08-14T08:00:00.000Z",
      sourceQuality: "high",
      windDirectionDegrees: 315,
      windSpeedKmh: 10,
      gustSpeedKmh: 18,
      waveHeightMeters: 0.3,
      weather: "sereno",
      temperatureCelsius: 29,
    },
  },
  {
    beach: {
      slug: "spiaggia-della-marchesa",
      name: "Spiaggia della Marchesa",
      municipality: "Avola",
      coast: "Sud-est",
      description: "Pineta, sabbia e un accesso semplice per una giornata senza troppi piani.",
      orientationDegrees: 95,
      shelter: ["maestrale", "ponente"],
      tags: ["relax", "snorkeling", "famiglie"],
      access: "facile",
    },
    conditions: {
      observedAt: "2026-08-14T08:00:00.000Z",
      sourceQuality: "medium",
      windDirectionDegrees: 315,
      windSpeedKmh: 12,
      gustSpeedKmh: 20,
      waveHeightMeters: 0.4,
      weather: "poco nuvoloso",
      temperatureCelsius: 29,
    },
  },
];

export function getDemoRecommendations(intent: UserIntent = "relax") {
  return demoBeachInputs
    .map(({ beach, conditions }) =>
      scoreBeach(beach, conditions, { intent, now: DEMO_NOW }),
    )
    .sort((left, right) => right.score - left.score);
}

export function getDemoRecommendation(slug: string, intent: UserIntent = "relax") {
  return getDemoRecommendations(intent).find(
    (recommendation) => recommendation.beach.slug === slug,
  );
}

export const demoRecommendations = getDemoRecommendations();
