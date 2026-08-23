import assets from "../../data/catalog/sicilia/image-assets.json";
import catalog from "../../data/catalog/sicilia/beaches.json";
import { describe, expect, it } from "vitest";
import { buildSicilianImageMediaCandidates } from "./catalog-image-media-import";

describe("Sicilian catalog image media", () => {
  it("builds one verified, attributed local photo for every beach", () => {
    const beachIds = new Map(catalog.map((beach) => [beach.slug, `id-${beach.slug}`]));
    const rows = buildSicilianImageMediaCandidates(
      assets,
      beachIds,
      "2026-08-22T00:00:00.000Z",
      "2027-08-22T00:00:00.000Z",
    );

    expect(rows).toHaveLength(28);
    expect(new Set(rows.map((row) => row.slug)).size).toBe(28);
    expect(rows.every((row) => row.kind === "photo")).toBe(true);
    expect(rows.every((row) => row.publication_status === "verified")).toBe(true);
    expect(rows.every((row) => row.media_url.startsWith("/images/beaches/"))).toBe(true);
    expect(rows.every((row) => row.credit.trim().length > 0 && row.license.trim().length > 0)).toBe(true);
  });

  it("refuses an image whose beach id is missing", () => {
    const beachIds = new Map([["not-in-catalog", "id-1"]]);

    expect(() =>
      buildSicilianImageMediaCandidates(
        [assets[0]],
        beachIds,
        "2026-08-22T00:00:00.000Z",
        "2027-08-22T00:00:00.000Z",
      ),
    ).toThrow(/Beach id missing/);
  });
});
