import catalog from "./beaches.json";
import { describe, expect, it } from "vitest";
import { validateSicilianCatalog } from "../../../src/data/catalog-contract";

describe("Sicilian candidate catalog", () => {
  it("contains 200 draft destinations with at least 20 per coastal province", () => {
    const result = validateSicilianCatalog(catalog);

    expect(result.issues).toEqual([]);
    expect(result.records).toHaveLength(200);
    expect(result.records.filter((record) => record.province === "TP")).toHaveLength(39);
    expect(result.records.filter((record) => record.province === "PA")).toHaveLength(41);
    expect(result.records.filter((record) => record.province === "ME")).toHaveLength(20);
    expect(result.records.filter((record) => record.province === "CT")).toHaveLength(20);
    expect(result.records.filter((record) => record.province === "SR")).toHaveLength(20);
    expect(result.records.filter((record) => record.province === "RG")).toHaveLength(20);
    expect(result.records.filter((record) => record.province === "AG")).toHaveLength(20);
    expect(result.records.filter((record) => record.province === "CL")).toHaveLength(20);
    expect(result.records.every((record) => record.region === "Sicilia")).toBe(true);
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
