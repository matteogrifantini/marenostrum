import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  demoRecommendations,
  DEMO_DATE_OPTIONS,
  getDemoRecommendationFor,
  getDemoRecommendationsFor,
  getDemoRecommendation,
} from "./demo-beaches";

describe("demoRecommendations", () => {
  it("contains published Sicilian recommendations with explainable scores", () => {
    expect(demoRecommendations.length).toBeGreaterThanOrEqual(3);

    for (const recommendation of demoRecommendations) {
      expect(recommendation.beach.slug).toMatch(/^[a-z0-9-]+$/);
      expect(recommendation.beach.coast).toBeTruthy();
      expect(recommendation.conditions.date).toBe("2026-08-15");
      expect(recommendation.conditions.period).toBe("all-day");
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

describe("dated demo forecasts", () => {
  it("covers four dates and three periods for every published beach", () => {
    for (const option of DEMO_DATE_OPTIONS) {
      for (const period of ["all-day", "morning", "afternoon"] as const) {
        const recommendations = getDemoRecommendationsFor({
          date: option.iso,
          period,
        });

        expect(recommendations).toHaveLength(3);
        expect(
          recommendations.every(
            ({ conditions }) =>
              conditions.date === option.iso && conditions.period === period,
          ),
        ).toBe(true);
      }
    }
  });

  it("changes the selected beach conditions when the period changes", () => {
    const morning = getDemoRecommendationFor("cala-del-gelsomino", {
      date: "2026-08-16",
      period: "morning",
    });
    const afternoon = getDemoRecommendationFor("cala-del-gelsomino", {
      date: "2026-08-16",
      period: "afternoon",
    });

    expect(morning?.conditions.period).toBe("morning");
    expect(afternoon?.conditions.period).toBe("afternoon");
    expect(morning?.conditions.windSpeedKmh).not.toBe(
      afternoon?.conditions.windSpeedKmh,
    );
  });
});

describe("published beach image metadata", () => {
  it("keeps every local image present, descriptive, and attributed", () => {
    const attribution = readFileSync(
      resolve(process.cwd(), "public/images/beaches/ATTRIBUTIONS.md"),
      "utf8",
    );

    for (const recommendation of demoRecommendations) {
      const { beach } = recommendation;
      const imagePath = beach.image?.replace(/^\//, "");

      expect(imagePath).toBe(`images/beaches/${beach.slug}.jpg`);
      expect(existsSync(resolve(process.cwd(), "public", imagePath ?? ""))).toBe(
        true,
      );
      expect(beach.imageAlt).toBeTruthy();
      expect(attribution).toContain(`\`${beach.slug}.jpg\``);
    }
  });
});
