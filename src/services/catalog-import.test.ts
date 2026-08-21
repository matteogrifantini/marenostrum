import { describe, expect, it, vi } from "vitest";
import {
  importCatalogCandidates,
  CatalogValidationError,
  type CatalogCandidateWriteStore,
} from "./catalog-import";
import type { SicilianCatalogRecord } from "../data/catalog-contract";

const record: SicilianCatalogRecord = {
  slug: "balestrate",
  name: "Balestrate",
  region: "Sicilia",
  province: "PA",
  municipality: "Balestrate",
  coast: "Nord-ovest",
  latitude: 38.043815,
  longitude: 12.987613,
  access_level: null,
  source_url: "https://www.visitsicily.info/migliori-spiagge-per-bambini-in-sicilia/",
  source_name: "Visit Sicily",
  source_type: "regional-tourism",
  verified_at: "2026-08-21T00:00:00.000Z",
  next_review_at: "2026-09-21T00:00:00.000Z",
  publication_status: "draft",
  notes: "Coordinate da verificare",
};

function createStore(): CatalogCandidateWriteStore & {
  writes: Array<unknown>;
} {
  const writes: Array<unknown> = [];

  return {
    writes,
    upsert: vi.fn(async (rows) => {
      writes.push(rows);
    }),
  };
}

describe("importCatalogCandidates", () => {
  it("writes validated draft candidates without promoting them", async () => {
    const store = createStore();

    const result = await importCatalogCandidates({ records: [record], store });

    expect(result).toEqual({ candidates: 1 });
    expect(store.upsert).toHaveBeenCalledOnce();
    expect(store.writes[0]).toEqual([
      expect.objectContaining({
        slug: "balestrate",
        publication_status: "draft",
        latitude: 38.043815,
        longitude: 12.987613,
      }),
    ]);
  });

  it("does not write an invalid catalog", async () => {
    const store = createStore();

    await expect(
      importCatalogCandidates({
        records: [{ ...record, source_url: "not-a-url" }],
        store,
      }),
    ).rejects.toBeInstanceOf(CatalogValidationError);

    expect(store.upsert).not.toHaveBeenCalled();
  });
});
