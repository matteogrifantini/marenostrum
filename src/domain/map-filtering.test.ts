import { describe, expect, it } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import {
  DEFAULT_BEACH_FILTERS,
  type BeachFilters,
} from "./beach-filters";
import { filterMapRecommendations } from "./map-filtering";

describe("filterMapRecommendations", () => {
  it("applies multiple factual filters without changing recommendations", () => {
    const sandyEasy = {
      ...demoRecommendations[0],
      beach: {
        ...demoRecommendations[0].beach,
        access: "facile" as const,
        tags: ["sabbia"],
      },
    };
    const rockyDifficult = {
      ...demoRecommendations[1],
      beach: {
        ...demoRecommendations[1].beach,
        access: "difficile" as const,
        tags: ["scogliera"],
      },
    };
    const filters: BeachFilters = {
      ...DEFAULT_BEACH_FILTERS,
      access: ["facile"],
      tags: ["sabbia"],
    };

    const result = filterMapRecommendations([sandyEasy, rockyDifficult], filters, null);

    expect(result).toEqual([sandyEasy]);
    expect(result[0].score).toBe(sandyEasy.score);
    expect(result[0].conditions).toEqual(sandyEasy.conditions);
  });

  it("limits and sorts beaches around the current position", () => {
    const nearest = {
      ...demoRecommendations[0],
      beach: { ...demoRecommendations[0].beach, latitude: 38.12, longitude: 13.36 },
    };
    const farther = {
      ...demoRecommendations[1],
      beach: { ...demoRecommendations[1].beach, latitude: 38.2, longitude: 13.5 },
    };

    const result = filterMapRecommendations(
      [farther, nearest],
      DEFAULT_BEACH_FILTERS,
      {
        coordinates: { latitude: 38.12, longitude: 13.36 },
        radiusKm: 10,
      },
    );

    expect(result).toEqual([nearest]);
  });
});
