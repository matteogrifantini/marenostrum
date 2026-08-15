import { describe, expect, it } from "vitest";
import type { Beach, BeachConditions, UserIntent } from "./beach";
import { scoreBeach } from "./score";

const shelteredBeach: Beach = {
  slug: "cala-demo",
  name: "Cala Demo",
  municipality: "Noto",
  coast: "Sud-est",
  description: "Una cala demo per il prototipo.",
  orientationDegrees: 120,
  shelter: ["maestrale", "ponente"],
  tags: ["relax", "famiglie"],
  access: "facile",
};

const calmConditions: BeachConditions = {
  observedAt: "2026-08-14T08:00:00.000Z",
  sourceQuality: "high",
  windDirectionDegrees: 315,
  windSpeedKmh: 8,
  gustSpeedKmh: 14,
  waveHeightMeters: 0.2,
  weather: "sereno",
  temperatureCelsius: 29,
};

const staleConditions: BeachConditions = {
  ...calmConditions,
  observedAt: "2026-08-12T08:00:00.000Z",
};

describe("scoreBeach", () => {
  it("ranks a calm, sheltered beach as a strong choice for a relaxed swim", () => {
    const result = scoreBeach(shelteredBeach, calmConditions, {
      intent: "relax" satisfies UserIntent,
      now: new Date("2026-08-14T09:00:00.000Z"),
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.label).toBe("Ottima scelta");
    expect(result.reason).toContain("riparata");
  });

  it("lowers confidence when the conditions snapshot is stale", () => {
    const result = scoreBeach(shelteredBeach, staleConditions, {
      intent: "relax",
      now: new Date("2026-08-14T09:00:00.000Z"),
    });

    expect(result.confidence).toBe("bassa");
    expect(result.reason).toContain("aggiornamento");
  });
});
