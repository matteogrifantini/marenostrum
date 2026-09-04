import catalog from "./beaches.json";
import { describe, expect, it } from "vitest";
import { validateSicilianCatalog } from "../../../src/data/catalog-contract";

describe("Sicilian candidate catalog", () => {
  it("contains the original 80 candidates plus 54 new draft destinations", () => {
    const result = validateSicilianCatalog(catalog);

    expect(result.issues).toEqual([]);
    expect(result.records).toHaveLength(134);
    expect(result.records.filter((record) => record.province === "TP")).toHaveLength(39);
    expect(result.records.filter((record) => record.province === "PA")).toHaveLength(41);
    expect(result.records.filter((record) => record.province === "ME")).toHaveLength(14);
    expect(result.records.filter((record) => record.province === "CT")).toHaveLength(9);
    expect(result.records.filter((record) => record.province === "SR")).toHaveLength(10);
    expect(result.records.filter((record) => record.province === "RG")).toHaveLength(8);
    expect(result.records.filter((record) => record.province === "AG")).toHaveLength(9);
    expect(result.records.filter((record) => record.province === "CL")).toHaveLength(4);
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
