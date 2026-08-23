import type { BeachAccess } from "../domain/beach";

export type SicilianBeachMasterSource = {
  source_name: string;
  source_type: string;
  source_url: string;
  role: "primary" | "coordinate-cross-check" | "access";
};

export type SicilianBeachMasterRecord = {
  slug: string;
  description: string;
  orientation_degrees: number;
  orientation_label: string;
  shelter: string[];
  tags: string[];
  access_level: BeachAccess;
  services: string[];
  warnings: string[];
  facts: string[];
  sources: SicilianBeachMasterSource[];
};

export type SicilianMasterCatalogValidationIssue = {
  index: number;
  code:
    | "record_not_object"
    | "slug_required"
    | "slug_invalid"
    | "duplicate_slug"
    | "description_required"
    | "orientation_invalid"
    | "orientation_label_required"
    | "access_invalid"
    | "array_invalid"
    | "facts_incomplete"
    | "source_required"
    | "source_invalid";
  message: string;
};

export type SicilianMasterCatalogEvaluation = {
  eligible: SicilianBeachMasterRecord[];
  blocked: Array<{ slug: string; reasons: string[] }>;
};

const accessLevels = new Set<BeachAccess>(["facile", "moderato", "difficile"]);
const sourceRoles = new Set<SicilianBeachMasterSource["role"]>([
  "primary",
  "coordinate-cross-check",
  "access",
]);
const requiredFactLabels = ["Suolo", "Fondale", "Esposizione", "Servizi", "Accesso", "Ambiente"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function hasCompleteFacts(facts: string[]) {
  const labels = facts.map((fact) => fact.split(" — ", 1)[0]);
  return (
    labels.length === requiredFactLabels.length &&
    labels.every((label, index) => label === requiredFactLabels[index])
  );
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function addIssue(
  issues: SicilianMasterCatalogValidationIssue[],
  index: number,
  code: SicilianMasterCatalogValidationIssue["code"],
  message: string,
) {
  issues.push({ index, code, message });
}

function validateMasterRecord(
  value: unknown,
  index: number,
  seenSlugs: Set<string>,
): { record: SicilianBeachMasterRecord | null; issues: SicilianMasterCatalogValidationIssue[] } {
  const issues: SicilianMasterCatalogValidationIssue[] = [];

  if (!isRecord(value)) {
    addIssue(issues, index, "record_not_object", "Master record must be an object");
    return { record: null, issues };
  }

  const slug = value.slug;
  if (!isNonEmptyString(slug)) {
    addIssue(issues, index, "slug_required", "slug is required");
  } else {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      addIssue(issues, index, "slug_invalid", "slug must use lowercase kebab-case");
    }
    if (seenSlugs.has(slug)) {
      addIssue(issues, index, "duplicate_slug", `slug ${slug} is duplicated`);
    }
    seenSlugs.add(slug);
  }

  if (!isNonEmptyString(value.description)) {
    addIssue(issues, index, "description_required", "description is required");
  }

  if (
    typeof value.orientation_degrees !== "number" ||
    !Number.isFinite(value.orientation_degrees) ||
    value.orientation_degrees < 0 ||
    value.orientation_degrees >= 360
  ) {
    addIssue(
      issues,
      index,
      "orientation_invalid",
      "orientation_degrees must be a finite number from 0 to 359",
    );
  }

  if (!isNonEmptyString(value.orientation_label)) {
    addIssue(issues, index, "orientation_label_required", "orientation_label is required");
  }

  if (typeof value.access_level !== "string" || !accessLevels.has(value.access_level as BeachAccess)) {
    addIssue(issues, index, "access_invalid", "access_level is not supported");
  }

  for (const field of ["shelter", "tags", "services", "warnings", "facts"]) {
    if (!isStringArray(value[field])) {
      addIssue(issues, index, "array_invalid", `${field} must be an array of strings`);
    }
  }

  if (isStringArray(value.facts) && !hasCompleteFacts(value.facts)) {
    addIssue(
      issues,
      index,
      "facts_incomplete",
      "facts must contain Suolo, Fondale, Esposizione, Servizi, Accesso and Ambiente in that order",
    );
  }

  if (!Array.isArray(value.sources) || value.sources.length === 0) {
    addIssue(issues, index, "source_required", "at least one source is required");
  } else {
    for (const source of value.sources) {
      if (
        !isRecord(source) ||
        !isNonEmptyString(source.source_name) ||
        !isNonEmptyString(source.source_type) ||
        !isHttpUrl(source.source_url) ||
        typeof source.role !== "string" ||
        !sourceRoles.has(source.role as SicilianBeachMasterSource["role"])
      ) {
        addIssue(issues, index, "source_invalid", "sources must contain valid source metadata");
        break;
      }
    }
  }

  if (issues.length > 0) {
    return { record: null, issues };
  }

  return {
    record: value as SicilianBeachMasterRecord,
    issues,
  };
}

export function validateSicilianMasterCatalog(input: unknown[]): {
  records: SicilianBeachMasterRecord[];
  issues: SicilianMasterCatalogValidationIssue[];
} {
  const records: SicilianBeachMasterRecord[] = [];
  const issues: SicilianMasterCatalogValidationIssue[] = [];
  const seenSlugs = new Set<string>();

  input.forEach((value, index) => {
    const result = validateMasterRecord(value, index, seenSlugs);
    if (result.record) records.push(result.record);
    issues.push(...result.issues);
  });

  return { records, issues };
}

function hasCoordinates(candidate: Record<string, unknown>): boolean {
  return (
    typeof candidate.latitude === "number" &&
    Number.isFinite(candidate.latitude) &&
    typeof candidate.longitude === "number" &&
    Number.isFinite(candidate.longitude)
  );
}

function hasAccess(candidate: Record<string, unknown>): candidate is Record<string, unknown> & {
  access_level: BeachAccess;
} {
  return typeof candidate.access_level === "string" && accessLevels.has(candidate.access_level as BeachAccess);
}

export function evaluateSicilianMasterCatalog(
  candidates: unknown[],
  contents: unknown[],
): SicilianMasterCatalogEvaluation {
  const eligible: SicilianBeachMasterRecord[] = [];
  const blocked: Array<{ slug: string; reasons: string[] }> = [];
  const validatedContents = validateSicilianMasterCatalog(contents);
  const contentBySlug = new Map(validatedContents.records.map((record) => [record.slug, record]));

  candidates.forEach((candidateValue) => {
    if (!isRecord(candidateValue) || typeof candidateValue.slug !== "string") return;

    const reasons: string[] = [];
    const content = contentBySlug.get(candidateValue.slug);
    const coordinatesPresent = hasCoordinates(candidateValue);

    if (candidateValue.publication_status !== "verified" || !coordinatesPresent) {
      reasons.push("candidate_not_verified");
    }
    if (!coordinatesPresent) {
      reasons.push("coordinates_required");
    }
    if (!hasAccess(candidateValue)) {
      reasons.push("access_required");
    }
    if (!content) {
      reasons.push("master_content_missing");
    }

    if (reasons.length > 0 || !content) {
      blocked.push({ slug: candidateValue.slug, reasons });
    } else {
      eligible.push(content);
    }
  });

  return { eligible, blocked };
}
