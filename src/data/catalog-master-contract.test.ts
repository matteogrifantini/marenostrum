import { describe, expect, it } from "vitest";
import {
  evaluateSicilianMasterCatalog,
  validateSicilianMasterCatalog,
  type SicilianBeachMasterRecord,
} from "./catalog-master-contract";

const validContent: SicilianBeachMasterRecord = {
  slug: "balestrate",
  description: "Litorale sabbioso e aperto sul golfo di Castellammare.",
  orientation_degrees: 0,
  orientation_label: "Nord",
  shelter: [],
  tags: ["famiglie", "relax"],
  access_level: "facile",
  services: [],
  warnings: ["Servizi e concessioni possono cambiare con la stagione."] ,
  facts: ["Spiaggia sabbiosa"],
  sources: [
    {
      source_name: "Visit Sicily",
      source_type: "regional-tourism",
      source_url: "https://www.visitsicily.info/migliori-spiagge-per-bambini-in-sicilia/",
      role: "primary",
    },
  ],
};

const validCandidate = {
  slug: "balestrate",
  name: "Balestrate",
  region: "Sicilia",
  province: "PA",
  municipality: "Balestrate",
  coast: "Nord-ovest",
  latitude: 38.043815,
  longitude: 12.987613,
  access_level: "facile",
  source_url: "https://www.visitsicily.info/migliori-spiagge-per-bambini-in-sicilia/",
  source_name: "Visit Sicily",
  source_type: "regional-tourism",
  verified_at: "2026-08-21T00:00:00.000Z",
  next_review_at: "2026-09-21T00:00:00.000Z",
  publication_status: "verified",
};

describe("validateSicilianMasterCatalog", () => {
  it("accepts complete source-backed master content", () => {
    expect(validateSicilianMasterCatalog([validContent])).toEqual({
      records: [validContent],
      issues: [],
    });
  });

  it("rejects missing descriptions, unsupported orientation and missing sources", () => {
    const result = validateSicilianMasterCatalog([
      {
        ...validContent,
        description: "",
        orientation_degrees: 360,
        sources: [],
      },
    ]);

    expect(result.issues.map((issue) => issue.code)).toEqual([
      "description_required",
      "orientation_invalid",
      "source_required",
    ]);
  });
});

describe("evaluateSicilianMasterCatalog", () => {
  it("makes a verified candidate eligible when master content and coordinates are complete", () => {
    const result = evaluateSicilianMasterCatalog([validCandidate], [validContent]);

    expect(result.eligible.map((record) => record.slug)).toEqual(["balestrate"]);
    expect(result.blocked).toEqual([]);
  });

  it("keeps draft candidates blocked even when their content is complete", () => {
    const result = evaluateSicilianMasterCatalog(
      [{ ...validCandidate, publication_status: "draft" }],
      [validContent],
    );

    expect(result.eligible).toEqual([]);
    expect(result.blocked).toEqual([
      { slug: "balestrate", reasons: ["candidate_not_verified"] },
    ]);
  });

  it("reports missing coordinates and content without throwing", () => {
    const result = evaluateSicilianMasterCatalog(
      [
        {
          ...validCandidate,
          latitude: null,
          longitude: null,
        },
      ],
      [],
    );

    expect(result.eligible).toEqual([]);
    expect(result.blocked).toEqual([
      {
        slug: "balestrate",
        reasons: ["candidate_not_verified", "coordinates_required", "master_content_missing"],
      },
    ]);
  });
});
