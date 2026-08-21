import beaches from "../../data/catalog/sicilia/beaches.json";
import content from "../../data/catalog/sicilia/content-candidates.json";
import { describe, expect, it } from "vitest";
import { validateSicilianContentCatalog } from "./catalog-content-contract";

describe("Sicilian structured content candidates", () => {
  it("contains only source-backed draft candidates for known beaches", () => {
    const beachSlugs = new Set(beaches.map((beach) => beach.slug));
    const result = validateSicilianContentCatalog(content, beachSlugs);

    expect(result.issues).toEqual([]);
    expect(result.catalog.parking).toHaveLength(19);
    expect(result.catalog.webcams).toHaveLength(5);
    expect(result.catalog.media).toHaveLength(4);
  });

  it("does not accept an unknown beach or an invalid source URL", () => {
    const result = validateSicilianContentCatalog(
      {
        parking: [
          {
            slug: "not-in-catalog",
            name: "Parcheggio candidato",
            facility_type: "parcheggio a raso",
            latitude: 38.1,
            longitude: 12.7,
            source_name: "OpenStreetMap",
            source_type: "osm-parking",
            source_url: "not-a-url",
          },
        ],
        webcams: [],
        media: [],
      },
      new Set(["balestrate"]),
    );

    expect(result.issues.map((issue) => issue.code)).toEqual([
      "slug_unknown",
      "source_url_invalid",
    ]);
  });
});
