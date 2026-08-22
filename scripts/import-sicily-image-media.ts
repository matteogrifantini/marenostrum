import { existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, relative, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import beaches from "../data/catalog/sicilia/beaches.json";
import imageAssets from "../data/catalog/sicilia/image-assets.json";
import {
  validateSicilianImageCatalog,
  type SicilianImageAssetRecord,
} from "../src/data/catalog-image-contract";
import {
  buildSicilianImageMediaCandidates,
  type SicilianImageMediaCandidate,
} from "../src/services/catalog-image-media-import";

const BEACH_SLUGS = new Set(beaches.map((beach) => beach.slug));
const CHECK_INTERVAL_DAYS = 365;

type BeachRow = {
  id: string;
  slug: string;
  is_published: boolean;
  publication_status: string;
};

type SourceRow = {
  id: string;
  beach_id: string;
  source_url: string;
};

type ExistingMediaRow = {
  id: string;
  beach_id: string;
  provider: string;
  provider_item_id: string | null;
  source_url: string;
  publication_status: string;
};

type MediaInsert = Omit<SicilianImageMediaCandidate, "slug"> & {
  id: string;
  source_id: string;
};

function throwOnError(context: string, error: { message: string } | null) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

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

function getLocalAssetPath(asset: SicilianImageAssetRecord) {
  const publicRoot = resolve(process.cwd(), "public");
  const assetPath = resolve(publicRoot, asset.image_path.replace(/^\/+/, ""));
  const assetRelativePath = relative(publicRoot, assetPath);

  if (!assetRelativePath || assetRelativePath.startsWith("..") || isAbsolute(assetRelativePath)) {
    throw new Error(`Refusing image path outside public/: ${asset.image_path}`);
  }

  return assetPath;
}

function validateLocalAssets(records: SicilianImageAssetRecord[]) {
  for (const record of records) {
    const path = getLocalAssetPath(record);
    if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size === 0) {
      throw new Error(`Local image asset is missing or empty: ${record.image_path}`);
    }
  }
}

async function loadBeaches(
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
    throw new Error(`Refusing image media import: beach rows are missing: ${missing.join(", ")}`);
  }
  return rowsBySlug;
}

async function loadOrCreateSources(
  client: ReturnType<typeof createSupabaseAdminClient>,
  beachesBySlug: Map<string, BeachRow>,
  assets: SicilianImageAssetRecord[],
  checkedAt: string,
  nextCheckAt: string,
): Promise<Map<string, SourceRow>> {
  const beachIds = Array.from(beachesBySlug.values()).map((beach) => beach.id);
  const { data, error } = await client
    .from("beach_sources")
    .select("id, beach_id, source_url")
    .in("beach_id", beachIds);
  throwOnError("Image source lookup failed", error);

  const existing = (data ?? []) as SourceRow[];
  const sourceByKey = new Map(existing.map((source) => [`${source.beach_id}:${source.source_url}`, source]));
  const missingSources = assets.flatMap((asset) => {
    const beach = beachesBySlug.get(asset.slug);
    if (!beach) throw new Error(`Beach row missing for ${asset.slug}`);
    const key = `${beach.id}:${asset.source_url}`;
    if (sourceByKey.has(key)) return [];
    return [{
      beach_id: beach.id,
      source_name: "Wikimedia Commons",
      source_type: "image-asset",
      source_url: asset.source_url,
      is_primary: false,
      checked_at: checkedAt,
      next_check_at: nextCheckAt,
      notes: "Local image asset with recorded credit and license; recheck source metadata annually.",
    }];
  });

  if (missingSources.length > 0) {
    const { error: insertError } = await client
      .from("beach_sources")
      .insert(missingSources);
    throwOnError("Image source insert failed", insertError);
  }

  const { data: finalData, error: finalError } = await client
    .from("beach_sources")
    .select("id, beach_id, source_url")
    .in("beach_id", beachIds);
  throwOnError("Image source readback failed", finalError);

  const finalSources = (finalData ?? []) as SourceRow[];
  const finalByKey = new Map(finalSources.map((source) => [`${source.beach_id}:${source.source_url}`, source]));
  for (const asset of assets) {
    const beach = beachesBySlug.get(asset.slug);
    if (!beach || !finalByKey.has(`${beach.id}:${asset.source_url}`)) {
      throw new Error(`Image source missing after write for ${asset.slug}`);
    }
  }
  return finalByKey;
}

function buildRows(
  candidates: SicilianImageMediaCandidate[],
  sourcesByKey: Map<string, SourceRow>,
): MediaInsert[] {
  return candidates.map((candidate) => {
    const source = sourcesByKey.get(`${candidate.beach_id}:${candidate.source_url}`);
    if (!source) throw new Error(`Image source id missing for ${candidate.slug}`);
    return {
      id: deterministicUuid(`image-media:${candidate.slug}:${candidate.source_url}`),
      beach_id: candidate.beach_id,
      kind: candidate.kind,
      provider: candidate.provider,
      provider_item_id: candidate.provider_item_id,
      source_url: candidate.source_url,
      media_url: candidate.media_url,
      credit: candidate.credit,
      license: candidate.license,
      captured_at: candidate.captured_at,
      verified_at: candidate.verified_at,
      expires_at: candidate.expires_at,
      publication_status: candidate.publication_status,
      source_id: source.id,
    };
  });
}

async function rejectProtectedMedia(
  client: ReturnType<typeof createSupabaseAdminClient>,
  rows: MediaInsert[],
) {
  const { data, error } = await client
    .from("media_items")
    .select("id, beach_id, provider, provider_item_id, source_url, publication_status")
    .in("id", rows.map((row) => row.id));
  throwOnError("Existing image media lookup failed", error);

  const protectedRows = ((data ?? []) as ExistingMediaRow[]).filter(
    (row) => !["draft", "verified", "stale"].includes(row.publication_status),
  );
  if (protectedRows.length > 0) {
    throw new Error(`Refusing to overwrite archived image media rows: ${protectedRows.map((row) => row.id).join(", ")}`);
  }
}

async function applyRows(
  client: ReturnType<typeof createSupabaseAdminClient>,
  rows: MediaInsert[],
) {
  await rejectProtectedMedia(client, rows);
  const { error } = await client.from("media_items").upsert(rows, { onConflict: "id" });
  throwOnError("Image media write failed", error);

  const { data, error: readbackError } = await client
    .from("media_items")
    .select("id, beach_id, provider, provider_item_id, source_url, media_url, credit, license, publication_status")
    .in("id", rows.map((row) => row.id));
  throwOnError("Image media readback failed", readbackError);

  const readback = (data ?? []) as Array<ExistingMediaRow & {
    media_url: string | null;
    credit: string | null;
    license: string | null;
  }>;
  const expectedById = new Map(rows.map((row) => [row.id, row]));
  if (readback.length !== rows.length) {
    throw new Error(`Image media readback count mismatch: expected ${rows.length}, got ${readback.length}`);
  }
  for (const row of readback) {
    const expected = expectedById.get(row.id);
    if (
      !expected ||
      row.beach_id !== expected.beach_id ||
      row.provider !== expected.provider ||
      row.provider_item_id !== expected.provider_item_id ||
      row.source_url !== expected.source_url ||
      row.media_url !== expected.media_url ||
      row.credit !== expected.credit ||
      row.license !== expected.license ||
      row.publication_status !== "verified"
    ) {
      throw new Error(`Image media readback mismatch for ${row.id}`);
    }
  }
}

async function main() {
  const validation = validateSicilianImageCatalog(imageAssets, BEACH_SLUGS);
  if (validation.issues.length > 0) {
    console.error(JSON.stringify({ mode: "rejected", issues: validation.issues }, null, 2));
    process.exitCode = 1;
    return;
  }
  validateLocalAssets(validation.records);

  const checkedAt = new Date();
  const verifiedAt = checkedAt.toISOString();
  const expiresAt = addDays(checkedAt, CHECK_INTERVAL_DAYS);

  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({
      mode: "dry-run",
      assets: validation.records.length,
      media_items: validation.records.length,
      publication_status: "verified",
      local_files: validation.records.length,
      writes: 0,
    }, null, 2));
    return;
  }

  const client = createSupabaseAdminClient();
  const beachesBySlug = await loadBeaches(client);
  const beachIds = new Map(Array.from(beachesBySlug.values()).map((beach) => [beach.slug, beach.id]));
  const candidates = buildSicilianImageMediaCandidates(validation.records, beachIds, verifiedAt, expiresAt);
  const sourcesByKey = await loadOrCreateSources(client, beachesBySlug, validation.records, verifiedAt, expiresAt);
  const rows = buildRows(candidates, sourcesByKey);
  await applyRows(client, rows);

  console.log(JSON.stringify({
    mode: "applied",
    assets: validation.records.length,
    media_items: rows.length,
    publication_status: "verified",
    verified: rows.length,
    expires_at: expiresAt,
  }, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Image media import failed";
  console.error(message);
  process.exitCode = 1;
});
