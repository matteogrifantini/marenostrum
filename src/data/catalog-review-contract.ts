export type ReviewProfileCandidate = {
  slug: string;
  provider: "google";
  place_id: string | null;
  maps_url: string;
  notes: string;
};

/** @deprecated Use ReviewProfileCandidate for new national imports. */
export type SicilianReviewProfileCandidate = ReviewProfileCandidate;

export type ReviewCatalogIssue = {
  index: number;
  code:
    | "record_not_object"
    | "required_field_missing"
    | "slug_unknown"
    | "missing_slug"
    | "duplicate_slug"
    | "provider_invalid"
    | "place_id_invalid"
    | "maps_url_invalid"
    | "maps_url_not_google";
  message: string;
};

/** @deprecated Use ReviewCatalogIssue for new national imports. */
export type SicilianReviewCatalogIssue = ReviewCatalogIssue;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseHttpUrl(value: unknown): URL | null {
  if (!isNonEmptyString(value)) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function validateReviewCatalog(
  input: unknown[],
  beachSlugs: ReadonlySet<string>,
): { records: ReviewProfileCandidate[]; issues: ReviewCatalogIssue[] } {
  const records: ReviewProfileCandidate[] = [];
  const issues: ReviewCatalogIssue[] = [];
  const seenSlugs = new Set<string>();

  input.forEach((value, index) => {
    if (!isRecord(value)) {
      issues.push({ index, code: "record_not_object", message: "Review candidate must be an object" });
      return;
    }

    const issueCountBefore = issues.length;
    const slug = value.slug;
    if (!isNonEmptyString(slug)) {
      issues.push({ index, code: "required_field_missing", message: "slug is required" });
    } else if (!beachSlugs.has(slug)) {
      issues.push({ index, code: "slug_unknown", message: `Unknown beach slug: ${slug}` });
    } else if (seenSlugs.has(slug)) {
      issues.push({ index, code: "duplicate_slug", message: `Duplicate review candidate: ${slug}` });
    } else {
      seenSlugs.add(slug);
    }

    if (value.provider !== "google") {
      issues.push({ index, code: "provider_invalid", message: "provider must be google" });
    }

    if (value.place_id !== null && !isNonEmptyString(value.place_id)) {
      issues.push({ index, code: "place_id_invalid", message: "place_id must be null or a non-empty string" });
    }

    const mapsUrl = parseHttpUrl(value.maps_url);
    if (!mapsUrl) {
      issues.push({ index, code: "maps_url_invalid", message: "maps_url must be an HTTP(S) URL" });
    } else if (!["www.google.com", "maps.google.com"].includes(mapsUrl.hostname)) {
      issues.push({ index, code: "maps_url_not_google", message: "maps_url must point to Google Maps" });
    }

    if (!isNonEmptyString(value.notes)) {
      issues.push({ index, code: "required_field_missing", message: "notes is required" });
    }

    if (issues.length === issueCountBefore) {
      records.push(value as ReviewProfileCandidate);
    }
  });

  for (const slug of beachSlugs) {
    if (!seenSlugs.has(slug)) {
      issues.push({
        index: input.length,
        code: "missing_slug",
        message: `Missing review candidate: ${slug}`,
      });
    }
  }

  return { records, issues };
}

/** @deprecated Use validateReviewCatalog for new national imports. */
export function validateSicilianReviewCatalog(
  input: unknown[],
  beachSlugs: ReadonlySet<string>,
): { records: SicilianReviewProfileCandidate[]; issues: SicilianReviewCatalogIssue[] } {
  return validateReviewCatalog(input, beachSlugs);
}
