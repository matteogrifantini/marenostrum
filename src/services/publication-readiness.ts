export type PublicationBlocker =
  | "missing_description"
  | "missing_coordinates"
  | "missing_primary_source"
  | "missing_image_metadata"
  | "missing_forecast";

export type PublicationGap =
  | "parking_unverified"
  | "media_unverified"
  | "webcam_unverified"
  | "review_profile_missing";

export type BeachPublicationReadinessInput = {
  slug: string;
  description: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  imagePath: string | null;
  imageAlt: string | null;
  imageCredit: string | null;
  imageLicense: string | null;
  hasPrimarySource: boolean;
  forecastRowCount: number;
  verifiedParkingCount: number;
  verifiedMediaCount: number;
  verifiedWebcamCount: number;
  verifiedReviewProfileCount: number;
};

export type BeachPublicationReadiness = {
  slug: string;
  ready: boolean;
  blockers: PublicationBlocker[];
  gaps: PublicationGap[];
};

function hasText(value: string | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteCoordinate(value: number | string | null) {
  if (value === null || value === "") return false;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number);
}

function hasCompleteImageMetadata(input: BeachPublicationReadinessInput) {
  return [input.imagePath, input.imageAlt, input.imageCredit, input.imageLicense].every(hasText);
}

export function evaluateBeachPublicationReadiness(
  input: BeachPublicationReadinessInput,
): BeachPublicationReadiness {
  const blockers: PublicationBlocker[] = [];
  const gaps: PublicationGap[] = [];

  if (!hasText(input.description)) blockers.push("missing_description");
  if (!isFiniteCoordinate(input.latitude) || !isFiniteCoordinate(input.longitude)) {
    blockers.push("missing_coordinates");
  }
  if (!input.hasPrimarySource) blockers.push("missing_primary_source");
  if (!hasCompleteImageMetadata(input)) blockers.push("missing_image_metadata");
  if (input.forecastRowCount < 1) blockers.push("missing_forecast");

  if (input.verifiedParkingCount < 1) gaps.push("parking_unverified");
  if (input.verifiedMediaCount < 1) gaps.push("media_unverified");
  if (input.verifiedWebcamCount < 1) gaps.push("webcam_unverified");
  if (input.verifiedReviewProfileCount < 1) gaps.push("review_profile_missing");

  return {
    slug: input.slug,
    ready: blockers.length === 0,
    blockers,
    gaps,
  };
}
