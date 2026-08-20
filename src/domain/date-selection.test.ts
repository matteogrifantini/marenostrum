import { describe, expect, it } from "vitest";
import {
  getDateOptions,
  getPeriodLabel,
  parseDateParam,
  parsePeriodParam,
} from "./date-selection";

describe("getDateOptions", () => {
  it("returns today plus the next three calendar dates", () => {
    expect(getDateOptions(new Date("2026-08-15T10:00:00+02:00"))).toEqual([
      { iso: "2026-08-15", label: "Oggi", relativeLabel: "sab 15" },
      { iso: "2026-08-16", label: "Domani", relativeLabel: "dom 16" },
      { iso: "2026-08-17", label: "lun 17", relativeLabel: "lun 17" },
      { iso: "2026-08-18", label: "mar 18", relativeLabel: "mar 18" },
    ]);
  });

  it("uses the Sicily calendar date when UTC is still on the previous day", () => {
    expect(getDateOptions(new Date("2026-08-19T22:30:00.000Z"))[0]).toMatchObject({
      iso: "2026-08-20",
      label: "Oggi",
    });
  });

  it("allows an explicit timezone for deterministic tests", () => {
    expect(
      getDateOptions(new Date("2026-08-20T00:30:00.000Z"), "America/New_York")[0].iso,
    ).toBe("2026-08-19");
  });
});

describe("query parsing", () => {
  it("accepts a valid date range when the process timezone is UTC+14", () => {
    expect(parseDateParam("2026-08-18", "2026-08-15")).toBe("2026-08-18");
  });

  it("falls back safely for invalid date and period parameters", () => {
    expect(parseDateParam("2026-09-01", "2026-08-15")).toBe("2026-08-15");
    expect(parsePeriodParam("night")).toBe("all-day");
  });

  it("returns the exact labels used by the forecast controls", () => {
    expect(getPeriodLabel("all-day")).toBe("Tutto il giorno");
    expect(getPeriodLabel("morning")).toBe("Mattina");
    expect(getPeriodLabel("afternoon")).toBe("Pomeriggio");
  });
});
