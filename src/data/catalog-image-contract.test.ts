import assets from "../../data/catalog/sicilia/image-assets.json";
import catalog from "../../data/catalog/sicilia/beaches.json";
import { describe, expect, it } from "vitest";
import { validateSicilianImageCatalog } from "./catalog-image-contract";

describe("Sicilian image assets", () => {
  it("contains source-backed assets for the curated image subset", () => {
    const result = validateSicilianImageCatalog(assets, new Set(catalog.map((beach) => beach.slug)));

    expect(result.issues).toEqual([]);
    expect(result.records).toHaveLength(34);
    expect(new Set(result.records.map((record) => record.slug)).size).toBe(34);
  });

  it("rejects duplicate paths and incomplete attribution", () => {
    const result = validateSicilianImageCatalog(
      [
        {
          slug: "one",
          image_path: "/images/beaches/one.jpg",
          image_alt: "Una spiaggia",
          image_credit: "Autore",
          image_license: "CC BY 4.0",
          source_url: "https://commons.wikimedia.org/wiki/File:One.jpg",
        },
        {
          slug: "two",
          image_path: "/images/beaches/one.jpg",
          image_alt: "",
          image_credit: null,
          image_license: "",
          source_url: "https://commons.wikimedia.org/wiki/File:Two.jpg",
        },
      ],
      new Set(["one", "two"]),
    );

    expect(result.issues.map((issue) => issue.code)).toEqual([
      "duplicate_image_path",
      "required_field_missing",
      "required_field_missing",
      "required_field_missing",
    ]);
  });
});
