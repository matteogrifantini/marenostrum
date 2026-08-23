import { describe, expect, it } from "vitest";
import type { BeachRecommendation } from "./beach";
import { filterRecommendationsForHub, getTerritoryHub, TERRITORY_HUBS } from "./territory-hubs";

const recommendation = (slug: string, provinceCode: string) => ({
  beach: { slug, provinceCode },
}) as BeachRecommendation;

describe("territory hubs", () => {
  it("exposes the six planned Sicilian SEO areas", () => {
    expect(TERRITORY_HUBS.map((hub) => hub.slug)).toEqual([
      "palermo",
      "trapani",
      "messina",
      "siracusa",
      "ragusa",
      "agrigento",
    ]);
  });

  it("filters recommendations without changing their weather score", () => {
    const hub = getTerritoryHub("palermo");
    expect(hub).not.toBeNull();
    const input = [recommendation("mondello", "PA"), recommendation("cala-rossa", "TP")];

    expect(filterRecommendationsForHub(input, hub!)).toEqual([input[0]]);
    expect(input[0].score).toBeUndefined();
  });

  it("returns null for an unknown area", () => {
    expect(getTerritoryHub("sconosciuta")).toBeNull();
  });
});
