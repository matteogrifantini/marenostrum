import { describe, expect, it } from "vitest";
import { hasUniqueTerritoryHubDescription, shouldIndexTerritoryHub } from "./sitemap-policy";

describe("shouldIndexTerritoryHub", () => {
  it("excludes empty and placeholder territory hubs", () => {
    expect(
      shouldIndexTerritoryHub({ publishedBeachCount: 0, hasUniqueDescription: true }),
    ).toBe(false);
    expect(
      shouldIndexTerritoryHub({ publishedBeachCount: 2, hasUniqueDescription: false }),
    ).toBe(false);
  });

  it("includes a territory hub with enough real published content", () => {
    expect(
      shouldIndexTerritoryHub({ publishedBeachCount: 2, hasUniqueDescription: true }),
    ).toBe(true);
  });

  it("recognizes placeholder descriptions", () => {
    expect(hasUniqueTerritoryHubDescription("Una pagina pronta ad accogliere le prossime spiagge verificate.")).toBe(false);
    expect(hasUniqueTerritoryHubDescription("Confronta vento, onde e cielo sulle spiagge della costa prima di partire.")).toBe(true);
  });
});
