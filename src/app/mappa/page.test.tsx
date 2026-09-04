import { describe, expect, it } from "vitest";
import { metadata } from "./page";

describe("map page metadata", () => {
  it("publishes national social metadata with a share image", () => {
    expect(metadata).toMatchObject({
      title: "Mappa delle spiagge d’Italia",
      description: "Esplora le spiagge d’Italia e le condizioni del mare",
      openGraph: expect.objectContaining({
        images: [
          expect.objectContaining({
            url: "https://marenostrum.app/opengraph-image",
            width: 1200,
            height: 630,
          }),
        ],
      }),
      twitter: expect.objectContaining({
        card: "summary_large_image",
        images: ["https://marenostrum.app/opengraph-image"],
      }),
    });
  });
});
