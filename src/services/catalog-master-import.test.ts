import { describe, expect, it } from "vitest";
import content from "../../data/catalog/sicilia/beach-content.json";
import {
  buildSicilianMasterDraftImport,
} from "./catalog-master-import";

const candidate = {
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
  publication_status: "draft",
  notes: "Coordinate confrontate con una fonte geografica.",
};

describe("buildSicilianMasterDraftImport", () => {
  it("builds complete but invisible beach and source rows", () => {
    const result = buildSicilianMasterDraftImport({
      candidates: [candidate],
      contents: [content.find((record) => record.slug === "balestrate")],
    });

    expect(result.blocked).toEqual([]);
    expect(result.beaches).toEqual([
      expect.objectContaining({
        slug: "balestrate",
        is_published: false,
        publication_status: "draft",
        latitude: 38.043815,
        longitude: 12.987613,
      }),
    ]);
    expect(result.sources).toEqual([
      expect.objectContaining({
        beach_slug: "balestrate",
        source_url: "https://www.visitsicily.info/migliori-spiagge-per-bambini-in-sicilia/",
        is_primary: true,
      }),
      expect.objectContaining({
        beach_slug: "balestrate",
        source_url: "https://www.openstreetmap.org/relation/12272249",
        is_primary: false,
      }),
    ]);
  });

  it("blocks a candidate without coordinates instead of creating a partial row", () => {
    const result = buildSicilianMasterDraftImport({
      candidates: [{ ...candidate, latitude: null, longitude: null }],
      contents: [content.find((record) => record.slug === "balestrate")],
    });

    expect(result.beaches).toEqual([]);
    expect(result.sources).toEqual([]);
    expect(result.blocked).toEqual([
      { slug: "balestrate", reasons: ["coordinates_required"] },
    ]);
  });
});
