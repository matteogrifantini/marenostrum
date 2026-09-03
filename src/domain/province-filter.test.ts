import { describe, expect, it } from "vitest";
import type { BeachRecommendation } from "./beach";
import {
  filterRecommendationsByProvince,
  normalizeProvinceCode,
  ITALIAN_PROVINCES,
} from "./province-filter";

describe("province filter", () => {
  it("exposes Italian provinces, including the current catalog provinces", () => {
    expect(ITALIAN_PROVINCES.map((province) => province.code)).toEqual(
      expect.arrayContaining([
        "AG",
        "CL",
        "CT",
        "EN",
        "ME",
        "PA",
        "RG",
        "SR",
        "TP",
        "RM",
        "NA",
        "VE",
      ]),
    );
    expect(ITALIAN_PROVINCES.length).toBeGreaterThan(100);
  });

  it("normalizes an unknown or empty query to the unselected national scope", () => {
    expect(normalizeProvinceCode(null)).toBe("all");
    expect(normalizeProvinceCode("not-a-province")).toBe("all");
    expect(normalizeProvinceCode("tp")).toBe("TP");
  });

  it("filters only by province metadata and keeps the all-island view intact", () => {
    const recommendations = [
      { beach: { slug: "palermo", provinceCode: "PA" } },
      { beach: { slug: "trapani", provinceCode: "TP" } },
      { beach: { slug: "unknown" } },
    ] as unknown as BeachRecommendation[];

    expect(filterRecommendationsByProvince(recommendations, "TP").map(({ beach }) => beach.slug)).toEqual([
      "trapani",
    ]);
    expect(filterRecommendationsByProvince(recommendations, "all")).toEqual(recommendations);
  });
});
