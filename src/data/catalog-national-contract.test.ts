import { describe, expect, it } from "vitest";
import { validateCatalog } from "./catalog-contract";
import { validateContentCatalog } from "./catalog-content-contract";
import { validateImageCatalog } from "./catalog-image-contract";

const validLiguriaDraft = {
  slug: "baia-del-silenzio",
  name: "Baia del Silenzio",
  region: "Liguria",
  province: "GE",
  municipality: "Sestri Levante",
  coast: "Riviera di Levante",
  latitude: 44.2734,
  longitude: 9.3936,
  access_level: "facile",
  source_url: "https://example.com/baia-del-silenzio",
  source_name: "Portale turistico locale",
  source_type: "municipal-tourism",
  verified_at: "2026-09-03T00:00:00.000Z",
  next_review_at: "2026-10-03T00:00:00.000Z",
  publication_status: "draft",
};

describe("validateCatalog", () => {
  it("accepts a sourced beach draft from a non-Sicilian Italian region", () => {
    expect(validateCatalog([validLiguriaDraft])).toMatchObject({
      records: [validLiguriaDraft],
      issues: [],
    });
  });

  it("rejects unsupported geography and records without a source", () => {
    const result = validateCatalog([
      {
        ...validLiguriaDraft,
        region: "Atlantide",
        province: "ZZ",
        source_url: "",
      },
    ]);

    expect(result.issues.map((issue) => issue.code)).toEqual([
      "required_field_missing",
      "region_invalid",
      "province_invalid",
    ]);
  });

  it("accepts content and image candidates outside the historical Sicily bounds", () => {
    const contentResult = validateContentCatalog(
      {
        parking: [
          {
            slug: "baia-del-silenzio",
            name: "Parcheggio Baia",
            facility_type: "parcheggio a raso",
            latitude: 44.2734,
            longitude: 9.3936,
            source_name: "Comune",
            source_type: "municipal-data",
            source_url: "https://example.com/parking",
          },
        ],
        webcams: [],
        media: [],
      },
      new Set(["baia-del-silenzio"]),
    );
    const imageResult = validateImageCatalog(
      [
        {
          slug: "baia-del-silenzio",
          image_path: "/images/beaches/baia-del-silenzio.jpg",
          image_alt: "La baia vista dalla passeggiata.",
          image_credit: "Comune",
          image_license: "CC BY 4.0",
          source_url: "https://commons.wikimedia.org/wiki/File:Baia.jpg",
        },
      ],
      new Set(["baia-del-silenzio"]),
    );

    expect(contentResult.issues).toEqual([]);
    expect(imageResult.issues).toEqual([]);
  });
});
