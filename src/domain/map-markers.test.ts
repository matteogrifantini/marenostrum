import { describe, expect, it } from "vitest";
import type { BeachRecommendation } from "./beach";
import { sortMappableRecommendations } from "./map-markers";

describe("sortMappableRecommendations", () => {
  it("sorts mappable recommendations by score, Italian name, then slug without mutating input", () => {
    const alfa = {
      beach: {
        slug: "zeta-slug",
        name: "Alfa",
        latitude: 38,
        longitude: 13,
      },
      score: 80,
    } as BeachRecommendation;
    const zeta = {
      beach: {
        slug: "alpha-slug",
        name: "Zeta",
        latitude: 38.1,
        longitude: 13.1,
      },
      score: 80,
    } as BeachRecommendation;
    const missingLatitude = {
      beach: {
        slug: "ignored",
        name: "Beta",
        longitude: 13.2,
      },
      score: 90,
    } as BeachRecommendation;
    const recommendations = [zeta, missingLatitude, alfa];

    const result = sortMappableRecommendations(recommendations);

    expect(result.map(({ beach }) => beach.name)).toEqual(["Alfa", "Zeta"]);
    expect(recommendations).toEqual([zeta, missingLatitude, alfa]);
    expect(result).not.toBe(recommendations);
  });
});
