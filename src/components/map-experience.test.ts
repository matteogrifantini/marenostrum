import { describe, expect, it } from "vitest";

import { buildMapQueryHref } from "./map-experience";

describe("buildMapQueryHref", () => {
  it("updates date and period while removing province for the all-island view", () => {
    expect(
      buildMapQueryHref({
        pathname: "/mappa",
        searchParams: "date=2026-08-20&period=morning&province=TP&source=map",
        date: "2026-08-21",
        period: "afternoon",
        province: "all",
      }),
    ).toBe("/mappa?date=2026-08-21&period=afternoon&source=map");
  });

  it("sets a normalized province without disturbing the current route state", () => {
    expect(
      buildMapQueryHref({
        pathname: "/mappa",
        searchParams: "date=2026-08-20&period=all-day",
        date: "2026-08-20",
        period: "all-day",
        province: "PA",
      }),
    ).toBe("/mappa?date=2026-08-20&period=all-day&province=PA");
  });
});
