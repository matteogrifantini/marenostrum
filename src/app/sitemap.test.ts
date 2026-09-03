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
      {
        slug: "mondello",
        provinceCode: "PA",
        description: "Una spiaggia urbana con fondale basso e servizi vicini al centro di Palermo.",
        updatedAt: "2026-09-02T08:00:00.000Z",
      },
      {
        slug: "addaura",
        provinceCode: "PA",
        description: "Una costa rocciosa e luminosa dove confrontare vento, onde e accesso al mare.",
        updatedAt: "2026-09-01T08:00:00.000Z",
      },
      {
        slug: "san-vito-lo-capo",
        provinceCode: "TP",
        description: "Una baia ampia da valutare con previsioni del mare e condizioni aggiornate.",
        updatedAt: "2026-08-31T08:00:00.000Z",
      },
      {
        slug: "castelluzzo",
        provinceCode: "TP",
        description: "Una costa aperta per confrontare vento, onde e cielo prima di partire.",
        updatedAt: "2026-08-30T08:00:00.000Z",
      },
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
          url: "https://marenostrum.app/spiagge/mondello",
          priority: 0.85,
          changeFrequency: "daily",
          lastModified: new Date("2026-09-02T08:00:00.000Z"),
        }),
        expect.objectContaining({
          url: "https://marenostrum.app/spiagge/san-vito-lo-capo",
          priority: 0.85,
          changeFrequency: "daily",
        }),
        expect.objectContaining({ url: "https://marenostrum.app/localita/palermo" }),
        expect.objectContaining({ url: "https://marenostrum.app/localita/trapani" }),
      ]),
    );
    expect(result.some(({ url }) => url.includes("?"))).toBe(false);
    expect(result.some(({ url }) => url === "https://marenostrum.app/localita/messina")).toBe(false);
    expect(result.some(({ url }) => url === "https://marenostrum.app/localita/siracusa")).toBe(false);
  });

  it("keeps only static core routes and reports a catalog failure", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    getAllPublishedBeachesMock.mockRejectedValue(new Error("DB error"));

    try {
      const result = await sitemap();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ url: "https://marenostrum.app" }),
          expect.objectContaining({ url: "https://marenostrum.app/mappa" }),
          expect.objectContaining({ url: "https://marenostrum.app/privacy" }),
          expect.objectContaining({ url: "https://marenostrum.app/cookie" }),
          expect.objectContaining({ url: "https://marenostrum.app/termini" }),
        ]),
      );
      expect(result.some(({ url }) => url.includes("/spiagge/"))).toBe(false);
      expect(result.some(({ url }) => url.includes("/localita/"))).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith("Sitemap beach catalog lookup failed", expect.any(Error));
    } finally {
      errorSpy.mockRestore();
    }
  });
});
