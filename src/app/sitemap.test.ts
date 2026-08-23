import { beforeEach, describe, expect, it, vi } from "vitest";

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
          priority: 0.8,
          changeFrequency: "hourly",
        }),
        expect.objectContaining({
          url: "https://marenostrum.app/spiagge/spiaggia-del-lungomare-cefalu",
          priority: 0.8,
          changeFrequency: "hourly",
        }),
      ]),
    );
  });

  it("falls back gracefully to static routes if database lookup fails", async () => {
    getAllPublishedBeachesMock.mockRejectedValue(new Error("DB error"));

    const result = await sitemap();

    expect(result).toHaveLength(5);
    expect(result[0].url).toBe("https://marenostrum.app");
    expect(result[1].url).toBe("https://marenostrum.app/mappa");
  });
});
