import { describe, expect, it } from "vitest";
import { buildNextDayHref, normalizeDetailQuery } from "./detail-query";

describe("normalizeDetailQuery", () => {
  it("resolves a valid detail date and period", () => {
    expect(
      normalizeDetailQuery("2026-08-16", "morning", "2026-08-15"),
    ).toEqual({ date: "2026-08-16", period: "morning" });
  });

  it("falls back to the first available day and all-day period", () => {
    expect(normalizeDetailQuery("2026-09-01", "night", "2026-08-15")).toEqual({
      date: "2026-08-15",
      period: "all-day",
    });
  });
});

describe("buildNextDayHref", () => {
  it("keeps the beach slug and period while replacing only the date", () => {
    expect(
      buildNextDayHref("cala-del-gelsomino", "2026-08-16", "morning"),
    ).toBe(
      "/spiagge/cala-del-gelsomino?date=2026-08-16&period=morning",
    );
  });
});
