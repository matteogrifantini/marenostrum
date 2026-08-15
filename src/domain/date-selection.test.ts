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
});

describe("query parsing", () => {
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
