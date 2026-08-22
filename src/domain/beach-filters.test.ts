import { describe, expect, it } from "vitest";
import type { Beach } from "./beach";
import {
  DEFAULT_BEACH_FILTERS,
  matchesBeachFilters,
  type BeachFilters,
} from "./beach-filters";

const beach: Beach = {
  slug: "cala-test",
  name: "Cala Test",
  municipality: "Palermo",
  coast: "Nord",
  description: "Baia sul lungomare con sentiero panoramico.",
  orientationDegrees: 180,
  shelter: [],
  tags: ["scogli", "famiglie"],
  access: "facile",
  services: ["parcheggio pubblico"],
  facts: ["Accesso dal sentiero costiero"],
};

describe("matchesBeachFilters", () => {
  it("includes every beach when all filter groups are empty", () => {
    expect(matchesBeachFilters(beach, DEFAULT_BEACH_FILTERS)).toBe(true);
  });

  it("uses OR within access and AND across access, tags and services", () => {
    const filters: BeachFilters = {
      access: ["facile", "moderato"],
      tags: ["scogliera", "famiglie"],
      services: ["parcheggio"],
    };

    expect(matchesBeachFilters(beach, filters)).toBe(true);
    expect(matchesBeachFilters(beach, { ...filters, access: ["difficile"] })).toBe(false);
    expect(matchesBeachFilters(beach, { ...filters, services: ["pineta"] })).toBe(false);
  });

  it("maps catalog language to the requested filter categories without guessing missing data", () => {
    expect(matchesBeachFilters(beach, { ...DEFAULT_BEACH_FILTERS, tags: ["trekking"] })).toBe(true);
    expect(matchesBeachFilters(beach, { ...DEFAULT_BEACH_FILTERS, tags: ["citta"] })).toBe(true);
    expect(matchesBeachFilters(beach, { ...DEFAULT_BEACH_FILTERS, tags: ["libera"] })).toBe(false);
    expect(matchesBeachFilters(beach, { ...DEFAULT_BEACH_FILTERS, tags: ["attrezzata"] })).toBe(false);
  });
});
