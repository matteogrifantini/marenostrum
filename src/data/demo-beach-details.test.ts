import { describe, expect, it } from "vitest";
import { demoBeachInputs } from "./demo-beaches";
import { getDemoBeachDetail } from "./demo-beach-details";

describe("demo beach detail fixtures", () => {
  it("provides every one-page section for each demo beach", () => {
    for (const { beach } of demoBeachInputs) {
      const detail = getDemoBeachDetail(beach.slug);

      expect(detail, beach.slug).toBeDefined();
      expect(detail?.reports.length).toBeGreaterThanOrEqual(3);
      expect(detail?.parkings).toHaveLength(2);
      expect(detail?.parkings.every((parking) => parking.name.length > 0)).toBe(true);
      expect(detail?.facts.map((fact) => fact.label)).toEqual([
        "Suolo",
        "Fondale",
        "Esposizione",
        "Servizi",
      ]);
      expect(detail?.reviews.items.length).toBeGreaterThanOrEqual(2);
      expect(detail?.recentPhotos.length).toBeGreaterThanOrEqual(3);
      expect(detail?.reels.length).toBeGreaterThanOrEqual(3);
      expect(detail?.webcam.distanceKm).toBeGreaterThan(0);
    }
  });
});
