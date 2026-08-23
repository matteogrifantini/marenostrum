import { describe, expect, it } from "vitest";
import type { BeachRecommendation } from "./beach";
import { getNearbyCalmRecommendations } from "./nearby-recommendations";

const coordinates = { latitude: 38.12, longitude: 13.36 };

function recommendation(
  slug: string,
  score: number,
  latitude: number,
  longitude: number,
  waveHeightMeters: number,
): BeachRecommendation {
  return {
    beach: {
      slug,
      name: slug,
      municipality: "Palermo",
      coast: "Nord",
      description: "Una spiaggia di prova.",
      orientationDegrees: 0,
      shelter: [],
      tags: [],
      access: "facile",
      latitude,
      longitude,
    },
    conditions: {
      observedAt: "2026-08-23T08:00:00+02:00",
      sourceQuality: "high",
      windDirectionDegrees: 0,
      windSpeedKmh: 8,
      gustSpeedKmh: 12,
      waveHeightMeters,
      seaState: waveHeightMeters < 0.45 ? "calmo" : "mosso",
      weather: "sereno",
      temperatureCelsius: 28,
    },
    score,
    label: "Buona scelta",
    reason: "Condizioni favorevoli.",
    confidence: "alta",
    factors: { wind: 40, sea: 25, weather: 20 },
  };
}

describe("getNearbyCalmRecommendations", () => {
  it("keeps the three highest-scoring calm beaches inside the selected radius", () => {
    const results = getNearbyCalmRecommendations(
      [
        recommendation("score-alto", 92, 38.13, 13.36, 0.2),
        recommendation("score-medio", 84, 38.14, 13.36, 0.3),
        recommendation("score-basso", 70, 38.15, 13.36, 0.2),
        recommendation("mare-mosso", 99, 38.12, 13.37, 0.8),
        recommendation("fuori-raggio", 100, 38.5, 13.36, 0.2),
      ],
      coordinates,
      20,
    );

    expect(results.map(({ recommendation: item }) => item.beach.slug)).toEqual([
      "score-alto",
      "score-medio",
      "score-basso",
    ]);
    expect(results[0].distanceKm).toBeGreaterThan(0);
    expect(results[0].distanceKm).toBeLessThan(results[1].distanceKm);
  });

  it("returns no compass suggestions when every nearby beach has rougher sea", () => {
    const results = getNearbyCalmRecommendations(
      [recommendation("mare-mosso", 99, 38.12, 13.37, 0.8)],
      coordinates,
      20,
    );

    expect(results).toEqual([]);
  });
});
