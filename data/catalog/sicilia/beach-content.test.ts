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
    expect(contentResult.records).toHaveLength(200);
    expect(new Set(contentResult.records.map((record) => record.slug)).size).toBe(200);
    expect(contentResult.records.map((record) => record.slug)).toEqual(
      candidateResult.records.map((record) => record.slug),
    );
  });

  it("provides all six structured information categories for every beach", () => {
    const requiredLabels = ["Suolo", "Fondale", "Esposizione", "Servizi", "Accesso", "Ambiente"];
    const contentResult = validateSicilianMasterCatalog(content);

    for (const record of contentResult.records) {
      const labels = record.facts.map((fact) => fact.split(" — ", 1)[0]);

      expect(labels, record.slug).toEqual(requiredLabels);
      expect(record.facts.every((fact) => fact.includes(" — "))).toBe(true);
    }
  });

  it("does not make draft candidates eligible for publication", () => {
    const result = evaluateSicilianMasterCatalog(candidates, content);

    expect(result.eligible).toEqual([]);
    expect(result.blocked).toHaveLength(200);
    expect(result.blocked.every(({ reasons }) => reasons.includes("candidate_not_verified"))).toBe(true);
  });
});
