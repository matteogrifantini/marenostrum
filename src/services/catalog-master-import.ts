import {
  validateSicilianCatalog,
  type SicilianCatalogRecord,
  type SicilianProvince,
} from "../data/catalog-contract";
import {
  validateSicilianMasterCatalog,
  type SicilianBeachMasterRecord,
  type SicilianMasterCatalogValidationIssue,
} from "../data/catalog-master-contract";

export type SicilianMasterDraftBeachInsert = {
  slug: string;
  name: string;
  municipality: string;
  coast: string;
  description: string;
  orientation_degrees: number;
  orientation_label: string;
  shelter: string[];
  tags: string[];
  access_level: SicilianBeachMasterRecord["access_level"];
  latitude: number;
  longitude: number;
  is_published: false;
  services: string[];
  warnings: string[];
  facts: string[];
  region_slug: "sicilia";
  province_code: SicilianProvince;
  publication_status: "draft";
  last_verified_at: string;
  next_review_at: string;
};

export type SicilianMasterDraftContentSource = {
  beach_slug: string;
  source_name: string;
  source_type: string;
  source_url: string;
  is_primary: boolean;
  checked_at: string;
  next_check_at: string;
  notes: string;
};

export type SicilianMasterDraftImportResult = {
  beaches: SicilianMasterDraftBeachInsert[];
  sources: SicilianMasterDraftContentSource[];
  blocked: Array<{ slug: string; reasons: string[] }>;
};

export class SicilianMasterCatalogValidationError extends Error {
  constructor(
    public readonly candidateIssues: ReturnType<typeof validateSicilianCatalog>["issues"],
    public readonly contentIssues: SicilianMasterCatalogValidationIssue[],
  ) {
    super("Sicilian master catalog validation failed");
    this.name = "SicilianMasterCatalogValidationError";
  }
}

function isCompleteCandidate(
  candidate: SicilianCatalogRecord,
): candidate is SicilianCatalogRecord & {
  latitude: number;
  longitude: number;
  access_level: NonNullable<SicilianCatalogRecord["access_level"]>;
} {
  return (
    typeof candidate.latitude === "number" &&
    Number.isFinite(candidate.latitude) &&
    typeof candidate.longitude === "number" &&
    Number.isFinite(candidate.longitude) &&
    candidate.access_level !== null
  );
}

function draftBeachFromRecords(
  candidate: SicilianCatalogRecord,
  content: SicilianBeachMasterRecord,
): SicilianMasterDraftBeachInsert {
  if (!isCompleteCandidate(candidate)) {
    throw new Error(`Candidate ${candidate.slug} is incomplete`);
  }

  return {
    slug: candidate.slug,
    name: candidate.name,
    municipality: candidate.municipality,
    coast: candidate.coast,
    description: content.description,
    orientation_degrees: content.orientation_degrees,
    orientation_label: content.orientation_label,
    shelter: content.shelter,
    tags: content.tags,
    access_level: content.access_level,
    latitude: candidate.latitude,
    longitude: candidate.longitude,
    is_published: false,
    services: content.services,
    warnings: content.warnings,
    facts: content.facts,
    region_slug: "sicilia",
    province_code: candidate.province,
    publication_status: "draft",
    last_verified_at: candidate.verified_at,
    next_review_at: candidate.next_review_at,
  };
}

function sourceRowsFromContent(
  candidate: SicilianCatalogRecord,
  content: SicilianBeachMasterRecord,
): SicilianMasterDraftContentSource[] {
  return content.sources.map((source) => ({
    beach_slug: candidate.slug,
    source_name: source.source_name,
    source_type: source.source_type,
    source_url: source.source_url,
    is_primary: source.role === "primary",
    checked_at: candidate.verified_at,
    next_check_at: candidate.next_review_at,
    notes: `Master catalog source; ruolo=${source.role}`,
  }));
}

export function buildSicilianMasterDraftImport({
  candidates,
  contents,
}: {
  candidates: unknown[];
  contents: unknown[];
}): SicilianMasterDraftImportResult {
  const candidateValidation = validateSicilianCatalog(candidates);
  const contentValidation = validateSicilianMasterCatalog(contents);

  if (candidateValidation.issues.length > 0 || contentValidation.issues.length > 0) {
    throw new SicilianMasterCatalogValidationError(
      candidateValidation.issues,
      contentValidation.issues,
    );
  }

  const contentBySlug = new Map(contentValidation.records.map((record) => [record.slug, record]));
  const beaches: SicilianMasterDraftBeachInsert[] = [];
  const sources: SicilianMasterDraftContentSource[] = [];
  const blocked: SicilianMasterDraftImportResult["blocked"] = [];

  candidateValidation.records.forEach((candidate) => {
    const reasons: string[] = [];
    const content = contentBySlug.get(candidate.slug);

    if (candidate.publication_status === "archived") {
      reasons.push("candidate_archived");
    }
    if (!isCompleteCandidate(candidate)) {
      if (
        typeof candidate.latitude !== "number" ||
        typeof candidate.longitude !== "number" ||
        !Number.isFinite(candidate.latitude) ||
        !Number.isFinite(candidate.longitude)
      ) {
        reasons.push("coordinates_required");
      }
      if (candidate.access_level === null) {
        reasons.push("access_required");
      }
    }
    if (!content) {
      reasons.push("master_content_missing");
    }

    if (reasons.length > 0 || !content) {
      blocked.push({ slug: candidate.slug, reasons });
      return;
    }

    beaches.push(draftBeachFromRecords(candidate, content));
    sources.push(...sourceRowsFromContent(candidate, content));
  });

  return { beaches, sources, blocked };
}
