import { describe, expect, it } from "vitest";
import type { BeachRecommendation } from "./beach";
import { filterRecommendationsByProvince, normalizeProvinceCode, SICILIAN_PROVINCES } from "./province-filter";

describe("province filter", () => {
  it("exposes all Sicilian provinces in display order", () => {
    expect(SICILIAN_PROVINCES.map((province) => province.code)).toEqual([
      "AG",
      "CL",
      "CT",
      "EN",
      "ME",
      "PA",
      "RG",
      "SR",
      "TP",
    ]);
  });

  it("normalizes an unknown or empty query to the whole island", () => {
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
