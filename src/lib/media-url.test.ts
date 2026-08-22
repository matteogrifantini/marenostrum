import { describe, expect, it } from "vitest";
import { versionedMediaUrl } from "./media-url";

describe("versionedMediaUrl", () => {
  it("busts the cache for local image assets", () => {
    expect(versionedMediaUrl("/images/beaches/cala-azzurra-favignana.jpg")).toBe(
      "/images/beaches/cala-azzurra-favignana.jpg?v=20260822",
    );
  });

  it("does not alter remote or already-versioned media URLs", () => {
    expect(versionedMediaUrl("https://example.com/beach.jpg")).toBe(
      "https://example.com/beach.jpg",
    );
    expect(versionedMediaUrl("/images/beach.jpg?v=custom")).toBe(
      "/images/beach.jpg?v=custom",
    );
  });
});
