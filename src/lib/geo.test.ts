import { describe, expect, it } from "vitest";
import { distanceKm } from "./geo";

describe("distanceKm", () => {
  it("returns zero for the same coordinates", () => {
    expect(distanceKm({ latitude: 36.8, longitude: 15.1 }, { latitude: 36.8, longitude: 15.1 })).toBe(0);
  });

  it("calculates the great-circle distance in kilometers", () => {
    expect(
      distanceKm({ latitude: 36.8, longitude: 15.1 }, { latitude: 37.8, longitude: 15.1 }),
    ).toBeCloseTo(111.2, 0);
  });
});
