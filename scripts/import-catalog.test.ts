import catalog from "../data/catalog/sicilia/beaches.json";
import { describe, expect, it } from "vitest";
import { buildCatalogReport } from "./catalog-validation";

describe("national catalog import report", () => {
  it("reports the 80-record catalog as valid new draft candidates", () => {
    const report = buildCatalogReport(catalog);

    expect(report.issues).toEqual([]);
    expect(report.summary).toEqual({
      new: 80,
      changed: 0,
      unchanged: 0,
      duplicate: 0,
      invalid: 0,
      stale: 0,
    });
  });

  it("separates duplicate and invalid records in the report", () => {
    const report = buildCatalogReport([
      ...catalog,
      { ...catalog[0], source_url: "not-a-url" },
    ]);

    expect(report.summary.duplicate).toBe(1);
    expect(report.summary.invalid).toBe(1);
    expect(report.summary.new).toBe(80);
  });
});
