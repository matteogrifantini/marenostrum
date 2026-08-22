import candidates from "../../data/catalog/sicilia/content-candidates.json";
import verification from "../../data/catalog/sicilia/content-verification.json";
import { describe, expect, it } from "vitest";
import { validateSicilianWebcamVerificationCatalog } from "./catalog-content-verification";

describe("Sicilian content verification manifest", () => {
  it("references only known webcam candidates", () => {
    const candidateSources = new Set(candidates.webcams.map((candidate) => candidate.source_url));
    const result = validateSicilianWebcamVerificationCatalog(verification.webcams, candidateSources);

    expect(result.issues).toEqual([]);
    expect(result.records).toHaveLength(5);
    expect(new Set(result.records.map((record) => record.source_url)).size).toBe(5);
    expect(result.records.every((record) => candidateSources.has(record.source_url))).toBe(true);
  });

  it("rejects a source that is not a candidate and an invalid status", () => {
    const result = validateSicilianWebcamVerificationCatalog(
      [
        {
          source_url: "https://example.com/webcam",
          status: "maybe",
          verification_note: "Nota",
        },
      ],
      new Set(["https://known.example/webcam"]),
    );

    expect(result.issues.map((issue) => issue.code)).toEqual([
      "source_unknown",
      "status_invalid",
    ]);
  });
});
