import type { BeachRecommendation } from "./beach";
import { distanceKm, type Coordinates } from "../lib/geo";

export type NearbyCalmRecommendation = {
  recommendation: BeachRecommendation;
  distanceKm: number;
};

function isCalm(recommendation: BeachRecommendation) {
  return recommendation.conditions.seaState === "calmo" || (
    recommendation.conditions.seaState === undefined &&
    recommendation.conditions.waveHeightMeters < 0.45
  );
}

export function getNearbyCalmRecommendations(
  recommendations: BeachRecommendation[],
  origin: Coordinates,
  radiusKm: number,
  limit = 3,
): NearbyCalmRecommendation[] {
  if (!Number.isFinite(radiusKm) || radiusKm <= 0 || limit <= 0) return [];

  return recommendations
    .flatMap((recommendation) => {
      const { latitude, longitude } = recommendation.beach;
      if (!isCalm(recommendation) || latitude == null || longitude == null) return [];

      const distance = distanceKm(origin, { latitude, longitude });
      if (distance > radiusKm) return [];

      return [{
        recommendation,
        distanceKm: Math.round(distance * 10) / 10,
      }];
    })
    .sort((left, right) =>
      right.recommendation.score - left.recommendation.score ||
      left.distanceKm - right.distanceKm,
    )
    .slice(0, limit);
}
