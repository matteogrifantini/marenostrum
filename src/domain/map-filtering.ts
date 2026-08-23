import type { BeachRecommendation } from "./beach";
import { matchesBeachFilters, type BeachFilters } from "./beach-filters";
import { distanceKm, type Coordinates } from "../lib/geo";

export type MapNearbySelection = {
  coordinates: Coordinates;
  radiusKm: number;
};

export function filterMapRecommendations(
  recommendations: BeachRecommendation[],
  filters: BeachFilters,
  nearby: MapNearbySelection | null,
) {
  const filtered = recommendations.filter(({ beach }) => matchesBeachFilters(beach, filters));
  if (!nearby) return filtered;

  return filtered
    .flatMap((recommendation) => {
      const { latitude, longitude } = recommendation.beach;
      if (latitude == null || longitude == null) return [];

      const distance = distanceKm(nearby.coordinates, { latitude, longitude });
      return distance <= nearby.radiusKm ? [{ recommendation, distance }] : [];
    })
    .sort((left, right) => left.distance - right.distance)
    .map(({ recommendation }) => recommendation);
}
