import { describe, expect, it } from "vitest";
import {
  demoRecommendations,
  getDemoRecommendation,
} from "./demo-beaches";

describe("demoRecommendations", () => {
  it("contains published Sicilian recommendations with explainable scores", () => {
    expect(demoRecommendations.length).toBeGreaterThanOrEqual(3);

    for (const recommendation of demoRecommendations) {
      expect(recommendation.beach.slug).toMatch(/^[a-z0-9-]+$/);
      expect(recommendation.beach.coast).toBeTruthy();
      expect(recommendation.conditions.observedAt).toContain("2026-08-14");
      expect(recommendation.score).toBeGreaterThanOrEqual(0);
      expect(recommendation.score).toBeLessThanOrEqual(100);
      expect(recommendation.reason).toBeTruthy();
    }
  });
});

describe("getDemoRecommendation", () => {
  it("returns the requested beach without changing the recommendation contract", () => {
    const recommendation = getDemoRecommendation("cala-del-gelsomino");

    expect(recommendation?.beach.name).toBe("Cala del Gelsomino");
    expect(recommendation?.conditions.windSpeedKmh).toBeGreaterThan(0);
    expect(recommendation?.reason).toContain("riparata");
  });
});
