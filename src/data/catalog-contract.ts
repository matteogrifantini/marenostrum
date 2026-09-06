import type { BeachAccess } from "../domain/beach";
import {
  ITALIAN_PROVINCES,
  ITALIAN_REGIONS,
  type ItalianProvinceCode,
} from "../domain/province-filter";

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

export type CatalogRegion = (typeof ITALIAN_REGIONS)[number]["label"];
export type CatalogPublicationStatus = "draft" | "verified" | "stale" | "archived";

export type CatalogRecord = {
  slug: string;
  name: string;
  region: CatalogRegion;
  province: ItalianProvinceCode;
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

/** @deprecated Use CatalogRecord for new national imports. */
export type SicilianCatalogRecord = Omit<CatalogRecord, "region" | "province"> & {
  region: "Sicilia";
  province: SicilianProvince;
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

type CoordinateBounds = {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
};

const ITALY_BOUNDS: CoordinateBounds = {
  minLatitude: 35,
  maxLatitude: 48,
  minLongitude: 6,
  maxLongitude: 19,
};

const SICILY_BOUNDS: CoordinateBounds = {
  minLatitude: 35,
  maxLatitude: 39,
  minLongitude: 11,
  maxLongitude: 16,
};

const accessLevels = new Set<BeachAccess>(["facile", "moderato", "difficile"]);
const publicationStatuses = new Set<CatalogPublicationStatus>([
  "draft",
  "verified",
  "stale",
  "archived",
]);
const regionLabels = new Set<string>(ITALIAN_REGIONS.map(({ label }) => label));
const provinceRegions = new Map<string, string>(
  ITALIAN_PROVINCES.map(({ code, regionCode }) => [code, regionCode]),
);
const regionCodes = new Map<string, string>(ITALIAN_REGIONS.map(({ code, label }) => [label, code]));

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

function validateCatalogWithOptions(
  input: unknown[],
  options: {
    allowedRegion?: CatalogRegion;
    coordinateBounds: CoordinateBounds;
    coordinateLabel: string;
  },
) {
  const issues: CatalogValidationIssue[] = [];
  const records: CatalogRecord[] = [];
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

    const region = value.region;
    const regionIsValid = typeof region === "string" && regionLabels.has(region);
    if (!regionIsValid || (options.allowedRegion && region !== options.allowedRegion)) {
      addIssue(
        issues,
        index,
        "region_invalid",
        options.allowedRegion
          ? `region must be ${options.allowedRegion}`
          : "region must be an Italian region",
      );
    }

    const province = value.province;
    const provinceIsValid = typeof province === "string" && provinceRegions.has(province);
    const provinceMatchesRegion =
      provinceIsValid &&
      (!regionIsValid || provinceRegions.get(province) === regionCodes.get(region as string));
    const provinceMatchesAllowedRegion =
      provinceIsValid &&
      (!options.allowedRegion || provinceRegions.get(province) === regionCodes.get(options.allowedRegion));
    if (!provinceMatchesRegion || !provinceMatchesAllowedRegion) {
      addIssue(
        issues,
        index,
        "province_invalid",
        options.allowedRegion
          ? "province must be a Sicilian province code"
          : "province must be an Italian province code matching the region",
      );
    }

    if (typeof sourceUrl !== "string") {
      addIssue(issues, index, "source_url_invalid", "source_url must be an http(s) URL");
    } else if (sourceUrl.trim().length > 0) {
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

    const validLatitude = typeof latitude === "number" && Number.isFinite(latitude);
    const validLongitude = typeof longitude === "number" && Number.isFinite(longitude);
    if (hasLatitude && !validLatitude) {
      addIssue(issues, index, "latitude_invalid", "latitude must be a finite number");
    } else if (
      hasLatitude &&
      validLatitude &&
      (latitude < options.coordinateBounds.minLatitude || latitude > options.coordinateBounds.maxLatitude)
    ) {
      addIssue(
        issues,
        index,
        "latitude_out_of_bounds",
        `latitude is outside ${options.coordinateLabel} bounds`,
      );
    }

    if (hasLongitude && !validLongitude) {
      addIssue(issues, index, "longitude_invalid", "longitude must be a finite number");
    } else if (
      hasLongitude &&
      validLongitude &&
      (longitude < options.coordinateBounds.minLongitude || longitude > options.coordinateBounds.maxLongitude)
    ) {
      addIssue(
        issues,
        index,
        "longitude_out_of_bounds",
        `longitude is outside ${options.coordinateLabel} bounds`,
      );
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
      (!hasLatitude || !hasLongitude || !validLatitude || !validLongitude)
    ) {
      addIssue(
        issues,
        index,
        "verified_coordinates_required",
        "verified records require coordinates",
      );
    }

    records.push(value as CatalogRecord);
  });

  return { records, issues };
}

export function validateCatalog(input: unknown[]): {
  records: CatalogRecord[];
  issues: CatalogValidationIssue[];
} {
  return validateCatalogWithOptions(input, {
    coordinateBounds: ITALY_BOUNDS,
    coordinateLabel: "Italy",
  });
}

/** @deprecated Use validateCatalog for new national imports. */
export function validateSicilianCatalog(input: unknown[]): {
  records: SicilianCatalogRecord[];
  issues: CatalogValidationIssue[];
} {
  const result = validateCatalogWithOptions(input, {
    allowedRegion: "Sicilia",
    coordinateBounds: SICILY_BOUNDS,
    coordinateLabel: "Sicily",
  });

  return {
    records: result.records as SicilianCatalogRecord[],
    issues: result.issues,
  };
}
