import {
  validateSicilianCatalog,
  type CatalogValidationIssue,
  type SicilianCatalogRecord,
} from "../data/catalog-contract";

export type CatalogCandidateInsert = Omit<SicilianCatalogRecord, "notes"> & {
  notes: string | null;
};

export type CatalogCandidateWriteStore = {
  upsert(rows: CatalogCandidateInsert[]): Promise<void>;
};

export class CatalogValidationError extends Error {
  constructor(public readonly issues: CatalogValidationIssue[]) {
    super("Sicilian catalog validation failed");
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
  const validation = validateSicilianCatalog(records);

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
