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

export function sortMappableRecommendations(
  recommendations: BeachRecommendation[],
): MappableRecommendation[] {
  return recommendations
    .filter(hasMapCoordinates)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      const nameOrder = left.beach.name.localeCompare(right.beach.name, "it-IT");
      if (nameOrder !== 0) {
        return nameOrder;
      }

      return left.beach.slug.localeCompare(right.beach.slug, "it-IT");
    });
}
