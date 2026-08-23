import candidates from "../../data/catalog/sicilia/review-candidates.json";
import catalog from "../../data/catalog/sicilia/beaches.json";
import { describe, expect, it } from "vitest";
import { validateSicilianReviewCatalog } from "./catalog-review-contract";

describe("Sicilian Google review candidates", () => {
  it("contains one draft search profile for every catalog beach", () => {
    const result = validateSicilianReviewCatalog(candidates, new Set(catalog.map((beach) => beach.slug)));

    expect(result.issues).toEqual([]);
    expect(result.records).toHaveLength(50);
    expect(new Set(result.records.map((record) => record.slug)).size).toBe(50);
    expect(result.records.every((record) => record.provider === "google" && record.place_id === null)).toBe(true);
  });

  it("rejects non-Google links, duplicate beaches, and invalid Place IDs", () => {
    const result = validateSicilianReviewCatalog(
      [
        {
          slug: "one",
          provider: "google",
          place_id: "",
          maps_url: "https://example.com/place",
          notes: "candidate",
        },
        {
          slug: "one",
          provider: "other",
          place_id: null,
          maps_url: "https://www.google.com/maps/search/?api=1&query=one",
          notes: "candidate",
        },
      ],
      new Set(["one"]),
    );

    expect(result.issues.map((issue) => issue.code)).toEqual([
      "place_id_invalid",
      "maps_url_not_google",
      "duplicate_slug",
      "provider_invalid",
    ]);
  });
});
