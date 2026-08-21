import { describe, expect, it } from "vitest";
import {
  validateSicilianCatalog,
  type SicilianCatalogRecord,
} from "./catalog-contract";

const validDraft: SicilianCatalogRecord = {
  slug: "balestrate",
  name: "Balestrate",
  region: "Sicilia",
  province: "PA",
  municipality: "Balestrate",
  coast: "Nord-ovest",
  latitude: 38.0438153,
  longitude: 12.9876126,
  access_level: "facile",
  source_url: "https://www.visitsicily.info/migliori-spiagge-per-bambini-in-sicilia/",
  source_name: "Visit Sicily",
  source_type: "regional-tourism",
  verified_at: "2026-08-21T00:00:00.000Z",
  next_review_at: "2026-09-21T00:00:00.000Z",
  publication_status: "draft",
};

describe("validateSicilianCatalog", () => {
  it("accepts a sourced Sicilian draft record", () => {
    const result = validateSicilianCatalog([validDraft]);

    expect(result.issues).toEqual([]);
    expect(result.records).toEqual([validDraft]);
  });

  it("allows a draft candidate without coordinates but keeps it unpublished", () => {
    const candidate = { ...validDraft, latitude: null, longitude: null };

    const result = validateSicilianCatalog([candidate]);

    expect(result.issues).toEqual([]);
    expect(result.records[0]?.publication_status).toBe("draft");
  });

  it("requires coordinates before a record can be verified", () => {
    const result = validateSicilianCatalog([
      { ...validDraft, latitude: null, longitude: null, publication_status: "verified" },
    ]);

    expect(result.issues).toEqual([
      expect.objectContaining({ code: "verified_coordinates_required" }),
    ]);
  });

  it("rejects duplicate slugs and invalid source URLs", () => {
    const result = validateSicilianCatalog([
      validDraft,
      { ...validDraft, name: "Balestrate duplicate", source_url: "not-a-url" },
    ]);

    expect(result.issues).toEqual([
      expect.objectContaining({ index: 1, code: "duplicate_slug" }),
      expect.objectContaining({ index: 1, code: "source_url_invalid" }),
    ]);
  });

  it("rejects coordinates outside the supported Sicily bounds", () => {
    const result = validateSicilianCatalog([
      { ...validDraft, latitude: 41, longitude: 12 },
    ]);

    expect(result.issues).toEqual([
      expect.objectContaining({ code: "latitude_out_of_bounds" }),
    ]);
  });
});
