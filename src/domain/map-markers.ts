import type { BeachRecommendation } from "./beach";

export type MappableRecommendation = BeachRecommendation & {
  beach: BeachRecommendation["beach"] & {
    latitude: number;
    longitude: number;
  };
};

export function hasMapCoordinates(
  recommendation: BeachRecommendation,
): recommendation is MappableRecommendation {
  const { latitude, longitude } = recommendation.beach;

  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  );
}
