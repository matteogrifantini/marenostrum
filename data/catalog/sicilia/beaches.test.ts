import catalog from "./beaches.json";
import { describe, expect, it } from "vitest";
import { validateSicilianCatalog } from "../../../src/data/catalog-contract";

describe("Sicilian candidate catalog", () => {
  it("contains 50 draft candidates across Sicily", () => {
    const result = validateSicilianCatalog(catalog);

    expect(result.issues).toEqual([]);
    expect(result.records).toHaveLength(50);
    expect(result.records.filter((record) => record.province === "TP")).toHaveLength(10);
    expect(result.records.filter((record) => record.province === "PA")).toHaveLength(11);
    expect(result.records.filter((record) => record.province === "SR")).toHaveLength(6);
    expect(result.records.filter((record) => record.province === "RG")).toHaveLength(4);
    expect(result.records.filter((record) => record.province === "AG")).toHaveLength(7);
    expect(result.records.filter((record) => record.province === "ME")).toHaveLength(8);
    expect(result.records.filter((record) => record.province === "CT")).toHaveLength(4);
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
