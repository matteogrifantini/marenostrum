import { describe, expect, it } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import type { MappableRecommendation } from "../domain/map-markers";
import { createBeachPopup } from "./leaflet-beach-map";

describe("createBeachPopup", () => {
  it("labels an unverified webcam without claiming it is live", () => {
    const recommendation: MappableRecommendation = {
      ...demoRecommendations[0],
      beach: {
        ...demoRecommendations[0].beach,
        latitude: 36.9436,
        longitude: 15.1953,
        webcam: {
          title: "Spiaggia e Golfo di Mondello",
          embedUrl: "https://provider.example/embed",
          liveUrl: "https://provider.example/live",
          verifiedLive: false,
        },
      },
    };

    const html = createBeachPopup(recommendation);

    expect(html).toContain("Webcam");
    expect(html).not.toContain("LIVE");
    expect(html).toContain("Indice condizioni del mare");
    expect(html).toContain("Una sintesi di vento, onde e meteo");
    expect(html).toContain("Vento 100/100");
    expect(html).toContain("non è un bollettino ufficiale");
  });
});
