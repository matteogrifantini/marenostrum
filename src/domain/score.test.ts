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

  it("uses only the current weather and sea conditions for the rating", () => {
    const sameWeatherDifferentProfile = scoreBeach(
      {
        ...shelteredBeach,
        access: "difficile",
        tags: ["snorkeling", "selvaggia"],
      },
      calmConditions,
      {
        intent: "explore",
        now: new Date("2026-08-14T09:00:00.000Z"),
      },
    );
    const originalProfile = scoreBeach(shelteredBeach, calmConditions, {
      intent: "relax",
      now: new Date("2026-08-14T09:00:00.000Z"),
    });

    expect(sameWeatherDifferentProfile.score).toBe(originalProfile.score);
    expect(sameWeatherDifferentProfile.factors).toEqual(originalProfile.factors);
  });

  it.each([
    [180, "all'ostro"],
    [135, "allo scirocco"],
    [0, "alla tramontana"],
  ])("uses the correct exposure article for the %s-degree wind", (windDirectionDegrees, article) => {
    const result = scoreBeach(shelteredBeach, {
      ...calmConditions,
      windDirectionDegrees,
    }, {
      intent: "relax",
      now: new Date("2026-08-14T09:00:00.000Z"),
    });

    expect(result.reason).toContain(`È esposta ${article}.`);
  });

  it("caps score for cloudy skies so it never receives a misleading excellent rating", () => {
    const cloudyResult = scoreBeach(
      shelteredBeach,
      { ...calmConditions, weather: "nuvoloso" },
      { intent: "relax", now: new Date("2026-08-14T09:00:00.000Z") },
    );

    expect(cloudyResult.score).toBeLessThan(70);
    expect(cloudyResult.label).not.toBe("Ottima scelta");
  });

  it("rewards off-shore winds compared to on-shore winds at the same wind speed", () => {
    // shelteredBeach is oriented at 120° (South-East)
    // Wind from 300° (North-West) is off-shore (blows from land to sea, angle difference 180°)
    // Wind from 120° (South-East) is on-shore (blows directly from sea to beach, angle difference 0°)
    const offshoreResult = scoreBeach(
      shelteredBeach,
      { ...calmConditions, windSpeedKmh: 24, gustSpeedKmh: 30, windDirectionDegrees: 300 },
      { intent: "relax", now: new Date("2026-08-14T09:00:00.000Z") },
    );

    const onshoreResult = scoreBeach(
      shelteredBeach,
      { ...calmConditions, windSpeedKmh: 24, gustSpeedKmh: 30, windDirectionDegrees: 120 },
      { intent: "relax", now: new Date("2026-08-14T09:00:00.000Z") },
    );

    expect(offshoreResult.score).toBeGreaterThan(onshoreResult.score);
  });

  it("penalizes high waves and rough sea appropriately", () => {
    const calmSea = scoreBeach(
      shelteredBeach,
      { ...calmConditions, waveHeightMeters: 0.15 },
      { intent: "relax", now: new Date("2026-08-14T09:00:00.000Z") },
    );

    const roughSea = scoreBeach(
      shelteredBeach,
      { ...calmConditions, waveHeightMeters: 1.1 },
      { intent: "relax", now: new Date("2026-08-14T09:00:00.000Z") },
    );

    expect(calmSea.score).toBeGreaterThanOrEqual(85);
    expect(roughSea.score).toBeLessThanOrEqual(45);
    expect(roughSea.label).toMatch(/Da valutare|Meglio cercare altrove/);
  });

  it("incorporates rain probability and cloud cover gradients", () => {
    const clearSky = scoreBeach(
      shelteredBeach,
      { ...calmConditions, cloudCoverPercent: 5, precipitationProbabilityPercent: 0 },
      { intent: "relax", now: new Date("2026-08-14T09:00:00.000Z") },
    );

    const highRainRisk = scoreBeach(
      shelteredBeach,
      { ...calmConditions, precipitationProbabilityPercent: 75 },
      { intent: "relax", now: new Date("2026-08-14T09:00:00.000Z") },
    );

    expect(clearSky.score).toBeGreaterThanOrEqual(85);
    expect(highRainRisk.score).toBeLessThanOrEqual(35);
  });

  it("penalizes uncomfortably cold air and water temperatures", () => {
    const warmDay = scoreBeach(
      shelteredBeach,
      { ...calmConditions, temperatureCelsius: 28, waterTemperatureCelsius: 24 },
      { intent: "relax", now: new Date("2026-08-14T09:00:00.000Z") },
    );

    const coldDay = scoreBeach(
      shelteredBeach,
      { ...calmConditions, temperatureCelsius: 16, waterTemperatureCelsius: 16 },
      { intent: "relax", now: new Date("2026-08-14T09:00:00.000Z") },
    );

    expect(warmDay.score).toBeGreaterThan(coldDay.score);
  });
});
