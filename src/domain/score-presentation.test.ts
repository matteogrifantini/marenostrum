import { describe, expect, it } from "vitest";

import { demoRecommendations } from "../data/demo-beaches";
import { getScorePresentation } from "./score-presentation";

describe("score presentation", () => {
  it("explains a high score with the public index vocabulary", () => {
    const presentation = getScorePresentation({
      ...demoRecommendations[0],
      score: 92,
      factors: { wind: 95, sea: 91, weather: 89 },
    });

    expect(presentation.title).toBe("Indice condizioni del mare");
    expect(presentation.label).toBe("Ottime condizioni");
    expect(presentation.factors.map((factor) => factor.label)).toEqual([
      "Vento",
      "Mare",
      "Meteo",
    ]);
    expect(presentation.factors.map((factor) => factor.value)).toEqual([95, 91, 89]);
    expect(presentation.explanation).toMatch(/vento, onde e meteo/i);
    expect(presentation.disclaimer).toMatch(/non è un bollettino ufficiale/i);
  });

  it("formats the observation freshness from the forecast payload", () => {
    const presentation = getScorePresentation({
      ...demoRecommendations[0],
      conditions: {
        ...demoRecommendations[0].conditions,
        observedAt: "2026-08-20T08:00:00Z",
      },
    });

    expect(presentation.freshnessText).toMatch(/Aggiornato/i);
    expect(presentation.freshnessText).toMatch(/20 agosto 2026/i);
  });
});
