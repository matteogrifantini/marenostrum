import { beforeEach, describe, expect, it, vi } from "vitest";
import { TERRITORY_HUBS } from "../domain/territory-hubs";

const { getAllPublishedBeachesMock } = vi.hoisted(() => ({
  getAllPublishedBeachesMock: vi.fn(),
}));

vi.mock("../data/beach-repository", () => ({
  getAllPublishedBeaches: getAllPublishedBeachesMock,
}));

import sitemap from "./sitemap";

describe("sitemap", () => {
  beforeEach(() => {
    getAllPublishedBeachesMock.mockReset();
  });

  it("returns static core routes and dynamic beach routes", async () => {
    getAllPublishedBeachesMock.mockResolvedValue([
      { slug: "cala-rossa-favignana" },
      { slug: "spiaggia-del-lungomare-cefalu" },
    ]);

    const result = await sitemap();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://marenostrum.app",
          priority: 1.0,
        }),
        expect.objectContaining({
          url: "https://marenostrum.app/privacy",
          priority: 0.3,
        }),
        expect.objectContaining({
          url: "https://marenostrum.app/cookie",
          priority: 0.3,
        }),
        expect.objectContaining({
          url: "https://marenostrum.app/termini",
          priority: 0.3,
        }),
        expect.objectContaining({
          url: "https://marenostrum.app/spiagge/cala-rossa-favignana",
          priority: 0.85,
          changeFrequency: "daily",
        }),
        expect.objectContaining({
          url: "https://marenostrum.app/spiagge/spiaggia-del-lungomare-cefalu",
          priority: 0.85,
          changeFrequency: "daily",
        }),
      ]),
    );
  });

  it("keeps static core routes and no beach routes if database lookup fails", async () => {
    getAllPublishedBeachesMock.mockRejectedValue(new Error("DB error"));

    const result = await sitemap();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://marenostrum.app" }),
        expect.objectContaining({ url: "https://marenostrum.app/mappa" }),
        expect.objectContaining({ url: "https://marenostrum.app/privacy" }),
        expect.objectContaining({ url: "https://marenostrum.app/cookie" }),
        expect.objectContaining({ url: "https://marenostrum.app/termini" }),
        ...TERRITORY_HUBS.map(({ slug }) =>
          expect.objectContaining({ url: `https://marenostrum.app/localita/${slug}` }),
        ),
      ]),
    );
    expect(result.some(({ url }) => url.includes("/spiagge/"))).toBe(false);
  });
});
