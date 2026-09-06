import { describe, expect, it } from "vitest";
import type { BeachRecommendation } from "./beach";
import { filterRecommendationsForHub, getTerritoryHub, TERRITORY_HUBS } from "./territory-hubs";

const recommendation = (slug: string, provinceCode: string, municipality?: string) => ({
  beach: { slug, provinceCode, municipality },
}) as BeachRecommendation;

describe("territory hubs", () => {
  it("exposes the planned Sicilian SEO areas including Favignana", () => {
    expect(TERRITORY_HUBS.map((hub) => hub.slug)).toEqual([
      "palermo",
      "trapani",
      "favignana",
      "messina",
      "siracusa",
      "ragusa",
      "agrigento",
    ]);
  });

  it("filters recommendations without changing their weather score", () => {
    const hub = getTerritoryHub("palermo");
    expect(hub).not.toBeNull();
    const input = [recommendation("mondello", "PA", "Palermo"), recommendation("cala-rossa", "TP", "Favignana")];

    expect(filterRecommendationsForHub(input, hub!)).toEqual([input[0]]);
    expect(input[0].score).toBeUndefined();
  });

  it("filters recommendations by municipality when specified", () => {
    const hub = getTerritoryHub("favignana");
    expect(hub).not.toBeNull();
    const input = [
      recommendation("san-vito", "TP", "San Vito Lo Capo"),
      recommendation("cala-rossa", "TP", "Favignana"),
      recommendation("mondello", "PA", "Palermo"),
    ];

    expect(filterRecommendationsForHub(input, hub!)).toEqual([input[1]]);
  });

  it("returns null for an unknown area", () => {
    expect(getTerritoryHub("sconosciuta")).toBeNull();
  });
});
