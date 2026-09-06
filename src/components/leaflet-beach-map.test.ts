import { describe, expect, it } from "vitest";

import type { BeachRecommendation } from "../domain/beach";
import { buildBeachMarkerModels } from "./leaflet-beach-map";

const recommendations: BeachRecommendation[] = [
  {
    beach: {
      slug: "zeta",
      name: "Zeta",
      municipality: "Trapani",
      provinceCode: "TP",
      coast: "Nord",
      description: "Una baia ampia.",
      orientationDegrees: 300,
      shelter: ["levante"],
      tags: ["relax"],
      access: "facile",
      latitude: 38.0176,
      longitude: 12.5365,
    },
    conditions: {
      observedAt: "2026-08-20T08:00:00+02:00",
      sourceQuality: "high",
      windDirectionDegrees: 90,
      windSpeedKmh: 10,
      gustSpeedKmh: 14,
      waveHeightMeters: 0.4,
      weather: "sereno",
      temperatureCelsius: 29,
      date: "2026-08-20",
      period: "all-day",
    },
    score: 60.4,
    label: "Buona",
    reason: "Condizioni discrete.",
    confidence: "alta",
    factors: { wind: 20, sea: 20, weather: 20 },
  },
  {
    beach: {
      slug: "alfa",
      name: "Alfa",
      municipality: "Palermo",
      provinceCode: "PA",
      coast: "Nord",
      description: "Una baia luminosa.",
      orientationDegrees: 320,
      shelter: ["scirocco"],
      tags: ["famiglie"],
      access: "facile",
      latitude: 38.1157,
      longitude: 13.3615,
    },
    conditions: {
      observedAt: "2026-08-20T08:00:00+02:00",
      sourceQuality: "high",
      windDirectionDegrees: 120,
      windSpeedKmh: 8,
      gustSpeedKmh: 11,
      waveHeightMeters: 0.3,
      weather: "sereno",
      temperatureCelsius: 28,
      date: "2026-08-20",
      period: "all-day",
    },
    score: 80.2,
    label: "Ottima",
    reason: "Condizioni favorevoli.",
    confidence: "alta",
    factors: { wind: 26, sea: 27, weather: 27 },
  },
  {
    beach: {
      slug: "ignored",
      name: "Ignored",
      municipality: "Marsala",
      provinceCode: "TP",
      coast: "Ovest",
      description: "Senza coordinate.",
      orientationDegrees: 280,
      shelter: ["tramontana"],
      tags: ["esplora"],
      access: "moderato",
      longitude: 12.44,
    },
    conditions: {
      observedAt: "2026-08-20T08:00:00+02:00",
      sourceQuality: "high",
      windDirectionDegrees: 35,
      windSpeedKmh: 12,
      gustSpeedKmh: 16,
      waveHeightMeters: 0.7,
      weather: "poco nuvoloso",
      temperatureCelsius: 27,
      date: "2026-08-20",
      period: "all-day",
    },
    score: 95,
    label: "Ottima",
    reason: "Non conta senza coordinate.",
    confidence: "alta",
    factors: { wind: 30, sea: 32, weather: 33 },
  },
];

describe("buildBeachMarkerModels", () => {
  it("sorts mappable beaches and assigns deterministic marker sizing", () => {
    const result = buildBeachMarkerModels(recommendations, null);

    expect(result.map(({ recommendation }) => recommendation.beach.slug)).toEqual(["alfa", "zeta"]);
    expect(result.map(({ iconSize }) => iconSize)).toEqual([
      [44, 30],
      [44, 30],
    ]);
    expect(result.map(({ iconAnchor }) => iconAnchor)).toEqual([
      [22, 15],
      [22, 15],
    ]);
  });

  it("gives the selected beach top z-index and keeps score-based ordering for the rest", () => {
    const result = buildBeachMarkerModels(recommendations, "zeta");

    expect(result.map(({ zIndexOffset }) => zIndexOffset)).toEqual([802, 10000]);
    expect(result[1]?.className).toContain("map-rating-marker--selected");
  });
});
