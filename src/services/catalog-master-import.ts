import {
  validateCatalog,
  type CatalogRecord,
  type CatalogValidationIssue,
} from "../data/catalog-contract";
import {
  validateMasterCatalog,
  type BeachMasterRecord,
  type MasterCatalogValidationIssue,
} from "../data/catalog-master-contract";
import { ITALIAN_REGIONS } from "../domain/province-filter";

export type MasterDraftBeachInsert = {
  slug: string;
  name: string;
  municipality: string;
  coast: string;
  description: string;
  orientation_degrees: number;
  orientation_label: string;
  shelter: string[];
  tags: string[];
  access_level: BeachMasterRecord["access_level"];
  latitude: number;
  longitude: number;
  is_published: false;
  services: string[];
  warnings: string[];
  facts: string[];
  country_code: "IT";
  region_code: string;
  region_name: string;
  region_slug: string;
  province_code: CatalogRecord["province"];
  publication_status: "draft";
  last_verified_at: string;
  next_review_at: string;
};

export type MasterDraftContentSource = {
  beach_slug: string;
  source_name: string;
  source_type: string;
  source_url: string;
  is_primary: boolean;
  checked_at: string;
  next_check_at: string;
  notes: string;
};

export type MasterDraftImportResult = {
  beaches: MasterDraftBeachInsert[];
  sources: MasterDraftContentSource[];
  blocked: Array<{ slug: string; reasons: string[] }>;
};

/** @deprecated Use MasterDraftBeachInsert for new national imports. */
export type SicilianMasterDraftBeachInsert = MasterDraftBeachInsert;
/** @deprecated Use MasterDraftContentSource for new national imports. */
export type SicilianMasterDraftContentSource = MasterDraftContentSource;
/** @deprecated Use MasterDraftImportResult for new national imports. */
export type SicilianMasterDraftImportResult = MasterDraftImportResult;

export class MasterCatalogValidationError extends Error {
  constructor(
    public readonly candidateIssues: CatalogValidationIssue[],
    public readonly contentIssues: MasterCatalogValidationIssue[],
  ) {
    super("National master catalog validation failed");
    this.name = "MasterCatalogValidationError";
  }
}

/** @deprecated Use MasterCatalogValidationError for new national imports. */
export class SicilianMasterCatalogValidationError extends MasterCatalogValidationError {
  constructor(
    candidateIssues: CatalogValidationIssue[],
    contentIssues: MasterCatalogValidationIssue[],
  ) {
    super(candidateIssues, contentIssues);
    this.name = "SicilianMasterCatalogValidationError";
  }
}

function regionSlug(region: string) {
  return region
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function regionCode(region: CatalogRecord["region"]) {
  return ITALIAN_REGIONS.find(({ label }) => label === region)?.code ?? "";
}

function isCompleteCandidate(
  candidate: CatalogRecord,
): candidate is CatalogRecord & {
  latitude: number;
  longitude: number;
  access_level: NonNullable<CatalogRecord["access_level"]>;
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
  candidate: CatalogRecord,
  content: BeachMasterRecord,
): MasterDraftBeachInsert {
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
    country_code: "IT",
    region_code: regionCode(candidate.region),
    region_name: candidate.region,
    region_slug: regionSlug(candidate.region),
    province_code: candidate.province,
    publication_status: "draft",
    last_verified_at: candidate.verified_at,
    next_review_at: candidate.next_review_at,
  };
}

function sourceRowsFromContent(
  candidate: CatalogRecord,
  content: BeachMasterRecord,
): MasterDraftContentSource[] {
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

export function buildMasterDraftImport({
  candidates,
  contents,
}: {
  candidates: unknown[];
  contents: unknown[];
}): MasterDraftImportResult {
  const candidateValidation = validateCatalog(candidates);
  const contentValidation = validateMasterCatalog(contents);

  if (candidateValidation.issues.length > 0 || contentValidation.issues.length > 0) {
    throw new MasterCatalogValidationError(
      candidateValidation.issues,
      contentValidation.issues,
    );
  }

  const contentBySlug = new Map(contentValidation.records.map((record) => [record.slug, record]));
  const beaches: MasterDraftBeachInsert[] = [];
  const sources: MasterDraftContentSource[] = [];
  const blocked: MasterDraftImportResult["blocked"] = [];

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

/** @deprecated Use buildMasterDraftImport for new national imports. */
export function buildSicilianMasterDraftImport(input: {
  candidates: unknown[];
  contents: unknown[];
}): SicilianMasterDraftImportResult {
  return buildMasterDraftImport(input);
}
