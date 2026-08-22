import { describe, expect, it } from "vitest";
import {
  evaluateBeachPublicationReadiness,
  type BeachPublicationReadinessInput,
} from "./publication-readiness";

const completeBeach: BeachPublicationReadinessInput = {
  slug: "san-vito-lo-capo",
  description: "Litorale ampio e sabbioso.",
  latitude: 38.178825,
  longitude: 12.732927,
  imagePath: "/images/beaches/san-vito-lo-capo.jpg",
  imageAlt: "Spiaggia di San Vito Lo Capo",
  imageCredit: "Archivio comunale",
  imageLicense: "CC BY 4.0",
  hasPrimarySource: true,
  forecastRowCount: 96,
  verifiedParkingCount: 0,
  verifiedMediaCount: 0,
  verifiedWebcamCount: 0,
  verifiedReviewProfileCount: 0,
};

describe("evaluateBeachPublicationReadiness", () => {
  it("allows publication when the catalog, hero asset and forecast are complete", () => {
    const result = evaluateBeachPublicationReadiness(completeBeach);

    expect(result).toEqual({
      slug: "san-vito-lo-capo",
      ready: true,
      blockers: [],
      gaps: [
        "parking_unverified",
        "media_unverified",
        "webcam_unverified",
        "review_profile_missing",
      ],
    });
  });

  it("separates publication blockers from optional community gaps", () => {
    const result = evaluateBeachPublicationReadiness({
      ...completeBeach,
      description: " ",
      latitude: null,
      imageCredit: null,
      imageLicense: null,
      hasPrimarySource: false,
      forecastRowCount: 0,
      verifiedParkingCount: 1,
      verifiedMediaCount: 1,
      verifiedWebcamCount: 1,
      verifiedReviewProfileCount: 1,
    });

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      "missing_description",
      "missing_coordinates",
      "missing_primary_source",
      "missing_image_metadata",
      "missing_forecast",
    ]);
    expect(result.gaps).toEqual([]);
  });
});
