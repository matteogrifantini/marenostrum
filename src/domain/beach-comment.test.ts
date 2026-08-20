import { describe, expect, it } from "vitest";
import { demoRecommendations } from "../data/demo-beaches";
import { getBeachAiComment } from "./beach-comment";

describe("getBeachAiComment", () => {
  it("summarizes the selected beach and day using the current conditions", () => {
    const result = getBeachAiComment(demoRecommendations[0]);

    expect(result.context).toBe("Sabato 15 agosto · Tutto il giorno");
    expect(result.text).toContain("Cielo sereno");
    expect(result.text).toContain("vento leggero");
    expect(result.text).toContain("mare calmo");
    expect(result.text).toContain("riparata dal maestrale");
    expect(result.text).not.toBe("È riparata dal maestrale.");
  });

  it("turns uncertain weather into a practical recommendation", () => {
    const rainyRecommendation = {
      ...demoRecommendations[0],
      conditions: {
        ...demoRecommendations[0].conditions,
        weather: "pioggia" as const,
        period: "afternoon" as const,
      },
    };

    const result = getBeachAiComment(rainyRecommendation);

    expect(result.context).toBe("Sabato 15 agosto · Pomeriggio");
    expect(result.text).toContain("Possibilità di pioggia");
    expect(result.text).toContain("piano flessibile");
  });

  it("uses the ostro article in the advice shown on the beach detail", () => {
    const result = getBeachAiComment({
      ...demoRecommendations[0],
      beach: { ...demoRecommendations[0].beach, shelter: [] },
      conditions: { ...demoRecommendations[0].conditions, windDirectionDegrees: 180 },
    });

    expect(result.text).toContain("È esposta all'ostro");
  });
});
