import { describe, expect, it } from "vitest";
import {
  communityReportCategories,
  getCommunityReportDetailOptions,
  isCommunityReportDetail,
} from "./community-reports";

describe("community report choices", () => {
  it("offers guided details for every report category", () => {
    expect(communityReportCategories.every((category) => category.details.length >= 4)).toBe(true);
    expect(getCommunityReportDetailOptions("water").map((option) => option.label)).toContain("Acqua limpida");
    expect(getCommunityReportDetailOptions("wind").map((option) => option.label)).toContain("Vento forte");
    expect(isCommunityReportDetail("water", "Acqua limpida")).toBe(true);
    expect(isCommunityReportDetail("water", "Testo scritto a mano")).toBe(false);
  });
});
