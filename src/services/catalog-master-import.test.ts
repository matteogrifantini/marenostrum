import { describe, expect, it } from "vitest";
import content from "../../data/catalog/sicilia/beach-content.json";
import {
  buildMasterDraftImport,
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
    expect(result.sources).toHaveLength(3);
    expect(result.sources).toEqual(expect.arrayContaining([
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
      expect.objectContaining({
        beach_slug: "balestrate",
        source_url: "https://turismo.cittametropolitana.pa.it/i-comuni-della-provincia/balestrate/",
        is_primary: false,
      }),
    ]));
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

describe("buildMasterDraftImport", () => {
  it("carries national geography into a non-Sicilian draft row", () => {
    const result = buildMasterDraftImport({
      candidates: [{
        ...candidate,
        slug: "baia-del-silenzio",
        name: "Baia del Silenzio",
        region: "Liguria",
        province: "GE",
        municipality: "Sestri Levante",
        latitude: 44.2734,
        longitude: 9.3936,
      }],
      contents: [{
        ...content.find((record) => record.slug === "balestrate"),
        slug: "baia-del-silenzio",
      }],
    });

    expect(result.blocked).toEqual([]);
    expect(result.beaches[0]).toMatchObject({
      country_code: "IT",
      region_code: "IT-42",
      region_name: "Liguria",
      region_slug: "liguria",
      province_code: "GE",
    });
  });
});
