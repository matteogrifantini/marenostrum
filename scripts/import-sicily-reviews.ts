import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import beaches from "../data/catalog/sicilia/beaches.json";
import candidates from "../data/catalog/sicilia/review-candidates.json";
import {
  validateSicilianReviewCatalog,
  type SicilianReviewProfileCandidate,
} from "../src/data/catalog-review-contract";

const BEACH_SLUGS = new Set(beaches.map((beach) => beach.slug));
const CHECK_INTERVAL_DAYS = 30;

type BeachRow = {
  id: string;
  slug: string;
  is_published: boolean;
  publication_status: string;
};

type ExistingReviewProfileRow = {
  id: string;
  beach_id: string;
  provider: string;
  place_id: string | null;
  maps_url: string;
  verification_status: string;
  notes: string | null;
};

type ReviewProfileInsert = {
  id: string;
  beach_id: string;
  provider: "google";
  place_id: string | null;
  maps_url: string;
  verification_status: "draft";
  checked_at: string;
  next_check_at: string;
  notes: string;
};

function deterministicUuid(key: string): string {
  const bytes = createHash("sha256").update(key).digest("hex").slice(0, 32).split("");
  bytes[12] = "5";
  bytes[16] = ["8", "9", "a", "b"][Number.parseInt(bytes[16], 16) % 4];
  const hex = bytes.join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString();
}

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin configuration is missing");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function throwOnError(context: string, error: { message: string } | null) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

async function loadDraftBeaches(
  client: ReturnType<typeof createSupabaseAdminClient>,
): Promise<Map<string, BeachRow>> {
  const { data, error } = await client
    .from("beaches")
    .select("id, slug, is_published, publication_status")
    .in("slug", Array.from(BEACH_SLUGS));
  throwOnError("Beach lookup failed", error);

  const rows = (data ?? []) as BeachRow[];
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
  const missing = Array.from(BEACH_SLUGS).filter((slug) => !rowsBySlug.has(slug));
  if (missing.length > 0) {
    throw new Error(`Refusing review import: beach rows are missing: ${missing.join(", ")}`);
  }

  const protectedRows = rows.filter(
    (row) => row.is_published || row.publication_status !== "draft",
  );
  if (protectedRows.length > 0) {
    throw new Error(
      `Refusing review import for protected beach rows: ${protectedRows.map((row) => row.slug).join(", ")}`,
    );
  }

  return rowsBySlug;
}

async function loadExistingProfiles(
  client: ReturnType<typeof createSupabaseAdminClient>,
  beachesBySlug: Map<string, BeachRow>,
): Promise<Map<string, ExistingReviewProfileRow>> {
  const beachIds = Array.from(beachesBySlug.values()).map((beach) => beach.id);
  const { data, error } = await client
    .from("review_profiles")
    .select("id, beach_id, provider, place_id, maps_url, verification_status, notes")
    .in("beach_id", beachIds)
    .eq("provider", "google");
  throwOnError("Review profile lookup failed", error);

  const rows = (data ?? []) as ExistingReviewProfileRow[];
  const byBeachId = new Map<string, ExistingReviewProfileRow>();
  for (const row of rows) {
    if (byBeachId.has(row.beach_id)) {
      throw new Error(`Refusing review import: multiple Google profiles for beach ${row.beach_id}`);
    }
    byBeachId.set(row.beach_id, row);
  }
  return byBeachId;
}

function buildRows(
  records: SicilianReviewProfileCandidate[],
  beachesBySlug: Map<string, BeachRow>,
  existingByBeachId: Map<string, ExistingReviewProfileRow>,
  checkedAt: string,
  nextCheckAt: string,
): ReviewProfileInsert[] {
  return records.map((record) => {
    const beach = beachesBySlug.get(record.slug);
    if (!beach) throw new Error(`Beach id missing for ${record.slug}`);

    const existing = existingByBeachId.get(beach.id);
    if (existing && existing.verification_status !== "draft") {
      throw new Error(
        `Refusing to overwrite protected Google profile for ${record.slug}: ${existing.verification_status}`,
      );
    }
    if (existing && existing.place_id !== record.place_id) {
      throw new Error(`Refusing to replace existing Google Place ID for ${record.slug}`);
    }
    if (existing && existing.maps_url !== record.maps_url) {
      throw new Error(`Refusing to replace existing Google Maps URL for ${record.slug}`);
    }

    return {
      id: existing?.id ?? deterministicUuid(`review:google:${record.slug}`),
      beach_id: beach.id,
      provider: "google",
      place_id: existing?.place_id ?? record.place_id,
      maps_url: existing?.maps_url ?? record.maps_url,
      verification_status: "draft",
      checked_at: checkedAt,
      next_check_at: nextCheckAt,
      notes: existing?.notes?.trim() || record.notes,
    };
  });
}

async function applyRows(
  client: ReturnType<typeof createSupabaseAdminClient>,
  rows: ReviewProfileInsert[],
) {
  const { error } = await client.from("review_profiles").upsert(rows, { onConflict: "id" });
  throwOnError("Review profile write failed", error);

  const beachIds = rows.map((row) => row.beach_id);
  const { data, error: readbackError } = await client
    .from("review_profiles")
    .select("id, beach_id, provider, place_id, maps_url, verification_status, notes")
    .in("beach_id", beachIds)
    .eq("provider", "google");
  throwOnError("Review profile readback failed", readbackError);

  const readback = (data ?? []) as ExistingReviewProfileRow[];
  const expectedByBeachId = new Map(rows.map((row) => [row.beach_id, row]));
  if (readback.length !== rows.length) {
    throw new Error(`Review profile readback count mismatch: expected ${rows.length}, got ${readback.length}`);
  }

  for (const row of readback) {
    const expected = expectedByBeachId.get(row.beach_id);
    if (
      !expected ||
      row.provider !== "google" ||
      row.place_id !== expected.place_id ||
      row.maps_url !== expected.maps_url ||
      row.verification_status !== "draft"
    ) {
      throw new Error(`Review profile readback mismatch for beach ${row.beach_id}`);
    }
  }
}

async function main() {
  const validation = validateSicilianReviewCatalog(candidates, BEACH_SLUGS);
  if (validation.issues.length > 0) {
    console.error(JSON.stringify({ mode: "rejected", issues: validation.issues }, null, 2));
    process.exitCode = 1;
    return;
  }

  const checkedAt = new Date();
  const nextCheckAt = addDays(checkedAt, CHECK_INTERVAL_DAYS);
  const records = validation.records;

  if (!process.argv.includes("--apply")) {
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          review_profiles: records.length,
          provider: "google",
          place_ids_verified: 0,
          verification_status: "draft",
          all_draft: true,
          next_check_at: nextCheckAt,
        },
        null,
        2,
      ),
    );
    return;
  }

  const client = createSupabaseAdminClient();
  const beachesBySlug = await loadDraftBeaches(client);
  const existingByBeachId = await loadExistingProfiles(client, beachesBySlug);
  const rows = buildRows(
    records,
    beachesBySlug,
    existingByBeachId,
    checkedAt.toISOString(),
    nextCheckAt,
  );
  await applyRows(client, rows);

  console.log(
    JSON.stringify(
      {
        mode: "applied",
        review_profiles: rows.length,
        provider: "google",
        place_ids_verified: rows.filter((row) => row.place_id !== null).length,
        verification_status: "draft",
        all_draft: true,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Review profile import failed";
  console.error(message);
  process.exitCode = 1;
});
