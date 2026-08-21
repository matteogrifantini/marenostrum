import type { BeachAccess } from "../domain/beach";

export type SicilianProvince =
  | "AG"
  | "CL"
  | "CT"
  | "EN"
  | "ME"
  | "PA"
  | "RG"
  | "SR"
  | "TP";

export type CatalogPublicationStatus = "draft" | "verified" | "stale" | "archived";

export type SicilianCatalogRecord = {
  slug: string;
  name: string;
  region: "Sicilia";
  province: SicilianProvince;
  municipality: string;
  coast: string;
  latitude: number | null;
  longitude: number | null;
  access_level: BeachAccess | null;
  source_url: string;
  source_name: string;
  source_type: string;
  verified_at: string;
  next_review_at: string;
  publication_status: CatalogPublicationStatus;
  notes?: string;
};

export type CatalogValidationIssue = {
  index: number;
  code:
    | "record_not_object"
    | "required_field_missing"
    | "region_invalid"
    | "province_invalid"
    | "slug_invalid"
    | "duplicate_slug"
    | "source_url_invalid"
    | "date_invalid"
    | "publication_status_invalid"
    | "coordinates_pair_required"
    | "latitude_invalid"
    | "latitude_out_of_bounds"
    | "longitude_invalid"
    | "longitude_out_of_bounds"
    | "verified_coordinates_required";
  message: string;
};

const provinces = new Set<SicilianProvince>([
  "AG",
  "CL",
  "CT",
  "EN",
  "ME",
  "PA",
  "RG",
  "SR",
  "TP",
]);

const accessLevels = new Set<BeachAccess>(["facile", "moderato", "difficile"]);
const publicationStatuses = new Set<CatalogPublicationStatus>([
  "draft",
  "verified",
  "stale",
  "archived",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function addIssue(
  issues: CatalogValidationIssue[],
  index: number,
  code: CatalogValidationIssue["code"],
  message: string,
) {
  issues.push({ index, code, message });
}

export function validateSicilianCatalog(input: unknown[]): {
  records: SicilianCatalogRecord[];
  issues: CatalogValidationIssue[];
} {
  const issues: CatalogValidationIssue[] = [];
  const records: SicilianCatalogRecord[] = [];
  const seenSlugs = new Set<string>();

  input.forEach((value, index) => {
    if (!isRecord(value)) {
      addIssue(issues, index, "record_not_object", "Catalog record must be an object");
      return;
    }

    const slug = value.slug;
    const sourceUrl = value.source_url;
    const verifiedAt = value.verified_at;
    const nextReviewAt = value.next_review_at;
    const publicationStatus = value.publication_status;
    const latitude = value.latitude;
    const longitude = value.longitude;

    for (const field of [
      "slug",
      "name",
      "municipality",
      "coast",
      "source_url",
      "source_name",
      "source_type",
    ]) {
      if (!isNonEmptyString(value[field])) {
        addIssue(issues, index, "required_field_missing", `${field} is required`);
      }
    }

    if (typeof slug === "string") {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        addIssue(issues, index, "slug_invalid", "slug must use lowercase kebab-case");
      }

      if (seenSlugs.has(slug)) {
        addIssue(issues, index, "duplicate_slug", `slug ${slug} is duplicated`);
      }

      seenSlugs.add(slug);
    }

    if (value.region !== "Sicilia") {
      addIssue(issues, index, "region_invalid", "region must be Sicilia");
    }

    if (typeof value.province !== "string" || !provinces.has(value.province as SicilianProvince)) {
      addIssue(issues, index, "province_invalid", "province must be a Sicilian province code");
    }

    if (typeof sourceUrl !== "string") {
      addIssue(issues, index, "source_url_invalid", "source_url must be an http(s) URL");
    } else {
      try {
        const parsed = new URL(sourceUrl);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          addIssue(issues, index, "source_url_invalid", "source_url must be an http(s) URL");
        }
      } catch {
        addIssue(issues, index, "source_url_invalid", "source_url must be an http(s) URL");
      }
    }

    if (!isValidIsoDate(verifiedAt) || !isValidIsoDate(nextReviewAt)) {
      addIssue(issues, index, "date_invalid", "verified_at and next_review_at must be ISO dates");
    }

    if (
      typeof publicationStatus !== "string" ||
      !publicationStatuses.has(publicationStatus as CatalogPublicationStatus)
    ) {
      addIssue(
        issues,
        index,
        "publication_status_invalid",
        "publication_status is not supported",
      );
    }

    const hasLatitude = latitude !== null && latitude !== undefined;
    const hasLongitude = longitude !== null && longitude !== undefined;

    if (hasLatitude !== hasLongitude) {
      addIssue(
        issues,
        index,
        "coordinates_pair_required",
        "latitude and longitude must be provided together",
      );
    }

    if (hasLatitude && (typeof latitude !== "number" || !Number.isFinite(latitude))) {
      addIssue(issues, index, "latitude_invalid", "latitude must be a finite number");
    } else if (hasLatitude && (latitude < 35 || latitude > 39)) {
      addIssue(issues, index, "latitude_out_of_bounds", "latitude is outside Sicily bounds");
    }

    if (hasLongitude && (typeof longitude !== "number" || !Number.isFinite(longitude))) {
      addIssue(issues, index, "longitude_invalid", "longitude must be a finite number");
    } else if (hasLongitude && (longitude < 11 || longitude > 16)) {
      addIssue(issues, index, "longitude_out_of_bounds", "longitude is outside Sicily bounds");
    }

    if (
      value.access_level !== null &&
      value.access_level !== undefined &&
      (typeof value.access_level !== "string" ||
        !accessLevels.has(value.access_level as BeachAccess))
    ) {
      addIssue(issues, index, "required_field_missing", "access_level is not supported");
    }

    if (
      publicationStatus === "verified" &&
      (!hasLatitude || !hasLongitude || typeof latitude !== "number" || typeof longitude !== "number")
    ) {
      addIssue(
        issues,
        index,
        "verified_coordinates_required",
        "verified records require coordinates",
      );
    }

    records.push(value as SicilianCatalogRecord);
  });

  return { records, issues };
}
