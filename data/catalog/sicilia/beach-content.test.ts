import candidates from "./beaches.json";
import content from "./beach-content.json";
import { describe, expect, it } from "vitest";
import { validateSicilianCatalog } from "../../../src/data/catalog-contract";
import {
  evaluateSicilianMasterCatalog,
  validateSicilianMasterCatalog,
} from "../../../src/data/catalog-master-contract";

describe("Sicilian master content", () => {
  it("contains one validated content record for every candidate", () => {
    const candidateResult = validateSicilianCatalog(candidates);
    const contentResult = validateSicilianMasterCatalog(content);

    expect(candidateResult.issues).toEqual([]);
    expect(contentResult.issues).toEqual([]);
    expect(contentResult.records).toHaveLength(21);
    expect(new Set(contentResult.records.map((record) => record.slug)).size).toBe(21);
    expect(contentResult.records.map((record) => record.slug)).toEqual(
      candidateResult.records.map((record) => record.slug),
    );
  });

  it("does not make draft candidates eligible for publication", () => {
    const result = evaluateSicilianMasterCatalog(candidates, content);

    expect(result.eligible).toEqual([]);
    expect(result.blocked).toHaveLength(21);
    expect(result.blocked.every(({ reasons }) => reasons.includes("candidate_not_verified"))).toBe(true);
  });
});
