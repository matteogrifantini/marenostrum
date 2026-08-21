import catalog from "./beaches.json";
import { describe, expect, it } from "vitest";
import { validateSicilianCatalog } from "../../../src/data/catalog-contract";

describe("Sicilian pilot catalog", () => {
  it("contains 21 draft candidates split across Trapani and Palermo", () => {
    const result = validateSicilianCatalog(catalog);

    expect(result.issues).toEqual([]);
    expect(result.records).toHaveLength(21);
    expect(result.records.filter((record) => record.province === "TP")).toHaveLength(10);
    expect(result.records.filter((record) => record.province === "PA")).toHaveLength(11);
    expect(result.records.every((record) => record.publication_status === "draft")).toBe(true);
  });

  it("keeps the two Cala Rossa candidates distinct", () => {
    const result = validateSicilianCatalog(catalog);
    const calaRossa = result.records.filter((record) => record.name === "Cala Rossa");

    expect(calaRossa.map((record) => record.slug)).toEqual([
      "cala-rossa-favignana",
      "cala-rossa-terrasini",
    ]);
  });
});
