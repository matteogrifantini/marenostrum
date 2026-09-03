import {
  validateCatalog,
  type CatalogValidationIssue,
  type CatalogRecord,
} from "../data/catalog-contract";

export type CatalogCandidateInsert = Omit<CatalogRecord, "notes"> & {
  notes: string | null;
};

export type CatalogCandidateWriteStore = {
  upsert(rows: CatalogCandidateInsert[]): Promise<void>;
};

export class CatalogValidationError extends Error {
  constructor(public readonly issues: CatalogValidationIssue[]) {
    super("National catalog validation failed");
    this.name = "CatalogValidationError";
  }
}

export async function importCatalogCandidates({
  records,
  store,
}: {
  records: unknown[];
  store: CatalogCandidateWriteStore;
}): Promise<{ candidates: number }> {
  const validation = validateCatalog(records);

  if (validation.issues.length > 0) {
    throw new CatalogValidationError(validation.issues);
  }

  const rows: CatalogCandidateInsert[] = validation.records.map((record) => ({
    ...record,
    notes: record.notes ?? null,
  }));

  await store.upsert(rows);

  return { candidates: rows.length };
}
