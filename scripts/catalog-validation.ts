import {
  validateCatalog,
  type CatalogValidationIssue,
  type CatalogRecord,
} from "../src/data/catalog-contract";

export type CatalogReportSummary = {
  new: number;
  changed: number;
  unchanged: number;
  duplicate: number;
  invalid: number;
  stale: number;
};

export type CatalogReport = {
  records: CatalogRecord[];
  issues: CatalogValidationIssue[];
  summary: CatalogReportSummary;
};

export function buildCatalogReport(input: unknown[]): CatalogReport {
  const validation = validateCatalog(input);
  const issueIndexes = new Set(validation.issues.map((issue) => issue.index));
  const duplicateIssues = validation.issues.filter(
    (issue) => issue.code === "duplicate_slug",
  );

  return {
    records: validation.records,
    issues: validation.issues,
    summary: {
      new: validation.records.filter((_, index) => !issueIndexes.has(index)).length,
      changed: 0,
      unchanged: 0,
      duplicate: duplicateIssues.length,
      invalid: validation.issues.filter((issue) => issue.code !== "duplicate_slug").length,
      stale: validation.records.filter((record) => record.publication_status === "stale").length,
    },
  };
}
