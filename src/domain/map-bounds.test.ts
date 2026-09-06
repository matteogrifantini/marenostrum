import { describe, expect, it } from "vitest";
import type { Beach } from "./beach";
import { getMapBounds, ITALY_MAP_BOUNDS } from "./map-bounds";

function beach(latitude?: number, longitude?: number): Beach {
  return {
    slug: `${latitude ?? "missing"}-${longitude ?? "missing"}`,
    name: "Spiaggia test",
    municipality: "Comune test",
    coast: "Costa test",
    description: "Una spiaggia di test.",
    orientationDegrees: 90,
    shelter: [],
    tags: [],
    access: "facile",
    ...(latitude === undefined ? {} : { latitude }),
    ...(longitude === undefined ? {} : { longitude }),
  };
}

describe("getMapBounds", () => {
  it("uses a safe national fallback when no marker is available", () => {
    expect(getMapBounds([], null)).toEqual(ITALY_MAP_BOUNDS);
  });

  it("pads a single marker so the map does not zoom into a point", () => {
    const bounds = getMapBounds([beach(41.9028, 12.4964)], null);

    expect(bounds[0][0]).toBeLessThan(41.9028);
    expect(bounds[0][1]).toBeLessThan(12.4964);
    expect(bounds[1][0]).toBeGreaterThan(41.9028);
    expect(bounds[1][1]).toBeGreaterThan(12.4964);
  });

  it("contains every returned marker with deterministic padding", () => {
    const bounds = getMapBounds(
      [beach(38.1157, 13.3615), beach(40.8518, 14.2681), beach(44.4056, 8.9463)],
      { kind: "region", regionCode: "IT-62" },
    );

    expect(bounds[0][0]).toBeLessThan(38.1157);
    expect(bounds[0][1]).toBeLessThan(13.3615);
    expect(bounds[1][0]).toBeGreaterThan(44.4056);
    expect(bounds[1][1]).toBeGreaterThan(14.2681);
  });

  it("keeps an empty nearby scope centered on the user's bounded radius", () => {
    const bounds = getMapBounds([], {
      kind: "nearby",
      latitude: 41.9028,
      longitude: 12.4964,
      radiusKm: 25,
    });

    expect(bounds[0][0]).toBeLessThan(41.9028);
    expect(bounds[1][0]).toBeGreaterThan(41.9028);
    expect(bounds[0][1]).toBeLessThan(12.4964);
    expect(bounds[1][1]).toBeGreaterThan(12.4964);
    expect(bounds[0][0]).toBeGreaterThan(41);
    expect(bounds[1][0]).toBeLessThan(43);
  });
});
