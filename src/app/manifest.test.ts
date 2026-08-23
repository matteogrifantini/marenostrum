import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("manifest", () => {
  it("generates a standalone PWA manifest with icons and theme colors", () => {
    const result = manifest();

    expect(result).toMatchObject({
      name: "Mare Nostrum — Scegli il mare giusto oggi",
      short_name: "Mare Nostrum",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#082f3d",
      orientation: "portrait",
    });

    expect(result.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/icon", sizes: "512x512" }),
        expect.objectContaining({ src: "/apple-icon", sizes: "180x180" }),
      ]),
    );
  });
});
