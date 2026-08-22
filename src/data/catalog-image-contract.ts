export type SicilianImageAssetRecord = {
  slug: string;
  image_path: string;
  image_alt: string;
  image_credit: string;
  image_license: string;
  source_url: string;
};

export type SicilianImageCatalogIssue = {
  index: number;
  code:
    | "record_not_object"
    | "required_field_missing"
    | "slug_unknown"
    | "duplicate_slug"
    | "duplicate_image_path"
    | "source_url_invalid";
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isHttpUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSicilianImageCatalog(
  input: unknown[],
  beachSlugs: ReadonlySet<string>,
): { records: SicilianImageAssetRecord[]; issues: SicilianImageCatalogIssue[] } {
  const records: SicilianImageAssetRecord[] = [];
  const issues: SicilianImageCatalogIssue[] = [];
  const seenSlugs = new Set<string>();
  const seenPaths = new Set<string>();

  input.forEach((value, index) => {
    if (!isRecord(value)) {
      issues.push({ index, code: "record_not_object", message: "Image asset must be an object" });
      return;
    }

    const issueCountBefore = issues.length;
    const slug = value.slug;
    if (!isNonEmptyString(slug)) {
      issues.push({ index, code: "required_field_missing", message: "slug is required" });
    } else if (!beachSlugs.has(slug)) {
      issues.push({ index, code: "slug_unknown", message: `Unknown beach slug: ${slug}` });
    } else if (seenSlugs.has(slug)) {
      issues.push({ index, code: "duplicate_slug", message: `Duplicate image slug: ${slug}` });
    } else {
      seenSlugs.add(slug);
    }

    const imagePath = value.image_path;
    if (!isNonEmptyString(imagePath)) {
      issues.push({ index, code: "required_field_missing", message: "image_path is required" });
    } else if (seenPaths.has(imagePath)) {
      issues.push({ index, code: "duplicate_image_path", message: `Duplicate image path: ${imagePath}` });
    } else {
      seenPaths.add(imagePath);
    }

    for (const field of ["image_alt", "image_credit", "image_license"] as const) {
      if (!isNonEmptyString(value[field])) {
        issues.push({ index, code: "required_field_missing", message: `${field} is required` });
      }
    }

    if (!isHttpUrl(value.source_url)) {
      issues.push({ index, code: "source_url_invalid", message: "source_url must be an HTTP(S) URL" });
    }

    if (issues.length === issueCountBefore) {
      records.push(value as SicilianImageAssetRecord);
    }
  });

  return { records, issues };
}
