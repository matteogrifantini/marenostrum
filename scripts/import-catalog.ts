import { createClient } from "@supabase/supabase-js";
import catalog from "../data/catalog/sicilia/beaches.json";
import {
  importCatalogCandidates,
  type CatalogCandidateInsert,
} from "../src/services/catalog-import";
import { buildCatalogReport } from "./catalog-validation";

function createSupabaseCandidateStore() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin configuration is missing");
  }

  const client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return {
    async upsert(rows: CatalogCandidateInsert[]) {
      const { error } = await client
        .from("beach_catalog_candidates")
        .upsert(rows, { onConflict: "slug" });

      if (error) {
        throw new Error(`Catalog candidate write failed: ${error.message}`);
      }
    },
  };
}

async function main() {
  const report = buildCatalogReport(catalog);

  if (report.issues.length > 0) {
    console.error(JSON.stringify({ mode: "rejected", ...report.summary, issues: report.issues }, null, 2));
    process.exitCode = 1;
    return;
  }

  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ mode: "dry-run", ...report.summary }, null, 2));
    return;
  }

  const result = await importCatalogCandidates({
    records: report.records,
    store: createSupabaseCandidateStore(),
  });

  console.log(JSON.stringify({ mode: "applied", ...result, ...report.summary }, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Catalog import failed";
  console.error(message);
  process.exitCode = 1;
});
