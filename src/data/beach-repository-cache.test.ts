import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BeachRow } from "./beach-repository";

const { createStoreMock, unstableCacheMock } = vi.hoisted(() => ({
  createStoreMock: vi.fn(),
  unstableCacheMock: vi.fn(() => async () => {
    throw new Error("cached catalog path used");
  }),
}));

vi.mock("next/cache", () => ({ unstable_cache: unstableCacheMock }));
vi.mock("../lib/supabase/server", () => ({
  createSupabaseForecastReadStore: createStoreMock,
}));

import { getAllPublishedBeaches } from "./beach-repository";

const publishedRow: BeachRow = {
  id: "liguria-beach",
  slug: "baia-ligure",
  name: "Baia Ligure",
  municipality: "La Spezia",
  country_code: "IT",
  region_code: "IT-42",
  region_name: "Liguria",
  region_slug: "liguria",
  province_code: "SP",
  province_name: "La Spezia",
  coast: "Levante",
  description: "Una baia ligure verificata.",
  orientation_degrees: 180,
  orientation_label: "Sud",
  shelter: [],
  tags: [],
  access_level: "facile",
  image_path: null,
  image_alt: null,
  image_credit: null,
  image_license: null,
  latitude: 44.1,
  longitude: 9.8,
  services: [],
  warnings: [],
  facts: [],
  publication_status: "verified",
  updated_at: "2026-09-03T08:00:00.000Z",
};

describe("published beach catalog cache policy", () => {
  beforeEach(() => {
    createStoreMock.mockReset();
    createStoreMock.mockResolvedValue({
      getPublishedBeaches: vi.fn().mockResolvedValue([publishedRow]),
    });
  });

  it("bypasses the stale cache for crawl-critical catalog reads", async () => {
    await expect(
      getAllPublishedBeaches(undefined, { bypassCache: true }),
    ).resolves.toEqual([
      expect.objectContaining({ slug: "baia-ligure", regionCode: "IT-42" }),
    ]);
    expect(createStoreMock).toHaveBeenCalledOnce();
  });
});
