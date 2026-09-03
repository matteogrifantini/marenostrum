import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import beaches from "../data/catalog/sicilia/beaches.json";
import candidates from "../data/catalog/sicilia/content-candidates.json";
import {
  validateContentCatalog,
  type MediaContentRecord,
  type ParkingContentRecord,
  type WebcamContentRecord,
} from "../src/data/catalog-content-contract";

const BEACH_SLUGS = new Set(beaches.map((beach) => beach.slug));
const CHECK_INTERVAL_DAYS = 30;

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
  is_primary: boolean;
};

type ParkingInsert = {
  id: string;
  beach_id: string;
  source_id: string;
  name: string;
  facility_type: string;
  latitude: number;
  longitude: number;
  pricing_note: string | null;
  access_note: string | null;
  content_status: "draft";
  checked_at: string;
  expires_at: string;
};

type MediaInsert = {
  id: string;
  beach_id: string;
  source_id: string;
  kind: MediaContentRecord["kind"];
  provider: string;
  provider_item_id: string | null;
  source_url: string;
  media_url: string | null;
  credit: string | null;
  license: string | null;
  verified_at: string | null;
  expires_at: string;
  publication_status: "draft";
};

type WebcamInsert = {
  id: string;
  beach_id: string;
  source_id: string;
  name: string;
  provider: string;
  page_url: string;
  snapshot_url: string | null;
  stream_url: string | null;
  latitude: number;
  longitude: number;
  status: "unknown";
  content_status: "draft";
  last_checked_at: string;
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

async function loadDraftBeaches(client: ReturnType<typeof createSupabaseAdminClient>): Promise<Map<string, BeachRow>> {
  const { data, error } = await client
    .from("beaches")
    .select("id, slug, is_published, publication_status")
    .in("slug", Array.from(BEACH_SLUGS));
  throwOnError("Beach lookup failed", error);

  const rows = (data ?? []) as BeachRow[];
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
  const missing = Array.from(BEACH_SLUGS).filter((slug) => !rowsBySlug.has(slug));
  if (missing.length > 0) {
    throw new Error(`Refusing content import: beach rows are missing: ${missing.join(", ")}`);
  }

  const protectedRows = rows.filter(
    (row) => row.is_published || row.publication_status !== "draft",
  );
  if (protectedRows.length > 0) {
    throw new Error(
      `Refusing content import for protected beach rows: ${protectedRows.map((row) => row.slug).join(", ")}`,
    );
  }

  return rowsBySlug;
}

async function loadOrCreateSources(
  client: ReturnType<typeof createSupabaseAdminClient>,
  beachesBySlug: Map<string, BeachRow>,
  records: Array<{
    slug: string;
    source_name: string;
    source_type: string;
    source_url: string;
  }>,
  checkedAt: string,
  nextCheckAt: string,
): Promise<Map<string, SourceRow>> {
  const beachIds = Array.from(beachesBySlug.values()).map((beach) => beach.id);
  const { data: existingData, error: existingError } = await client
    .from("beach_sources")
    .select("id, beach_id, source_url, is_primary")
    .in("beach_id", beachIds);
  throwOnError("Source lookup failed", existingError);

  const existing = (existingData ?? []) as SourceRow[];
  const sourceByKey = new Map(existing.map((source) => [`${source.beach_id}:${source.source_url}`, source]));
  const sourceRows = new Map<string, {
    beach_id: string;
    source_name: string;
    source_type: string;
    source_url: string;
    is_primary: false;
    checked_at: string;
    next_check_at: string;
    notes: string;
  }>();

  for (const record of records) {
    const beach = beachesBySlug.get(record.slug);
    if (!beach) throw new Error(`Beach id missing for ${record.slug}`);
    const key = `${beach.id}:${record.source_url}`;
    if (sourceByKey.has(key) || sourceRows.has(key)) continue;
    sourceRows.set(key, {
      beach_id: beach.id,
      source_name: record.source_name,
      source_type: record.source_type,
      source_url: record.source_url,
      is_primary: false,
      checked_at: checkedAt,
      next_check_at: nextCheckAt,
      notes: "Structured content candidate; draft; source and usage rights require verification.",
    });
  }

  if (sourceRows.size > 0) {
    const { error } = await client.from("beach_sources").insert(Array.from(sourceRows.values()));
    throwOnError("Source insert failed", error);
  }

  const { data: finalData, error: finalError } = await client
    .from("beach_sources")
    .select("id, beach_id, source_url, is_primary")
    .in("beach_id", beachIds);
  throwOnError("Final source lookup failed", finalError);

  const finalSources = (finalData ?? []) as SourceRow[];
  const finalByKey = new Map(finalSources.map((source) => [`${source.beach_id}:${source.source_url}`, source]));
  for (const key of sourceRows.keys()) {
    if (!finalByKey.has(key)) throw new Error(`Source row missing after insert: ${key}`);
  }
  return finalByKey;
}

function buildParkingRows(
  records: ParkingContentRecord[],
  beachesBySlug: Map<string, BeachRow>,
  sourcesByKey: Map<string, SourceRow>,
  checkedAt: string,
  expiresAt: string,
): ParkingInsert[] {
  return records.map((record) => {
    const beach = beachesBySlug.get(record.slug);
    if (!beach) throw new Error(`Beach id missing for ${record.slug}`);
    const source = sourcesByKey.get(`${beach.id}:${record.source_url}`);
    if (!source) throw new Error(`Source id missing for parking ${record.slug}`);
    return {
      id: deterministicUuid(`parking:${record.slug}:${record.source_url}`),
      beach_id: beach.id,
      source_id: source.id,
      name: record.name,
      facility_type: record.facility_type,
      latitude: record.latitude,
      longitude: record.longitude,
      pricing_note: record.pricing_note ?? null,
      access_note: record.access_note ?? null,
      content_status: "draft",
      checked_at: checkedAt,
      expires_at: expiresAt,
    };
  });
}

function buildMediaRows(
  records: MediaContentRecord[],
  beachesBySlug: Map<string, BeachRow>,
  sourcesByKey: Map<string, SourceRow>,
  expiresAt: string,
): MediaInsert[] {
  return records.map((record) => {
    const beach = beachesBySlug.get(record.slug);
    if (!beach) throw new Error(`Beach id missing for ${record.slug}`);
    const source = sourcesByKey.get(`${beach.id}:${record.source_url}`);
    if (!source) throw new Error(`Source id missing for media ${record.slug}`);
    return {
      id: deterministicUuid(`media:${record.slug}:${record.source_url}`),
      beach_id: beach.id,
      source_id: source.id,
      kind: record.kind,
      provider: record.provider,
      provider_item_id: record.provider_item_id ?? null,
      source_url: record.source_url,
      media_url: record.media_url ?? null,
      credit: record.credit ?? null,
      license: record.license ?? null,
      verified_at: null,
      expires_at: expiresAt,
      publication_status: "draft",
    };
  });
}

function buildWebcamRows(
  records: WebcamContentRecord[],
  beachesBySlug: Map<string, BeachRow>,
  sourcesByKey: Map<string, SourceRow>,
  checkedAt: string,
  nextCheckAt: string,
): WebcamInsert[] {
  return records.map((record) => {
    const beach = beachesBySlug.get(record.slug);
    if (!beach) throw new Error(`Beach id missing for ${record.slug}`);
    const source = sourcesByKey.get(`${beach.id}:${record.source_url}`);
    if (!source) throw new Error(`Source id missing for webcam ${record.slug}`);
    return {
      id: deterministicUuid(`webcam:${record.slug}:${record.provider}:${record.page_url}`),
      beach_id: beach.id,
      source_id: source.id,
      name: record.name,
      provider: record.provider,
      page_url: record.page_url,
      snapshot_url: null,
      stream_url: null,
      latitude: record.latitude,
      longitude: record.longitude,
      status: record.status,
      content_status: "draft",
      last_checked_at: checkedAt,
      next_check_at: nextCheckAt,
      notes: record.notes,
    };
  });
}

async function rejectProtectedContentRows(
  client: ReturnType<typeof createSupabaseAdminClient>,
  parking: ParkingInsert[],
  media: MediaInsert[],
  webcams: WebcamInsert[],
) {
  const parkingIds = parking.map((row) => row.id);
  const mediaIds = media.map((row) => row.id);
  const webcamIds = webcams.map((row) => row.id);

  const [parkingResult, mediaResult, webcamResult] = await Promise.all([
    client.from("parking_facilities").select("id, content_status").in("id", parkingIds),
    client.from("media_items").select("id, publication_status").in("id", mediaIds),
    client.from("webcams").select("id, content_status").in("id", webcamIds),
  ]);
  throwOnError("Parking safety lookup failed", parkingResult.error);
  throwOnError("Media safety lookup failed", mediaResult.error);
  throwOnError("Webcam safety lookup failed", webcamResult.error);

  const protectedParking = (parkingResult.data ?? []).filter((row) => row.content_status !== "draft");
  const protectedMedia = (mediaResult.data ?? []).filter((row) => row.publication_status !== "draft");
  const protectedWebcams = (webcamResult.data ?? []).filter((row) => row.content_status !== "draft");
  if (protectedParking.length || protectedMedia.length || protectedWebcams.length) {
    throw new Error(
      `Refusing to overwrite protected content rows: parking=${protectedParking.length}, media=${protectedMedia.length}, webcams=${protectedWebcams.length}`,
    );
  }
}

async function applyRows(
  client: ReturnType<typeof createSupabaseAdminClient>,
  parking: ParkingInsert[],
  media: MediaInsert[],
  webcams: WebcamInsert[],
) {
  await rejectProtectedContentRows(client, parking, media, webcams);

  const parkingResult = await client.from("parking_facilities").upsert(parking, { onConflict: "id" });
  throwOnError("Parking write failed", parkingResult.error);

  const mediaResult = await client.from("media_items").upsert(media, { onConflict: "id" });
  throwOnError("Media write failed", mediaResult.error);

  const webcamResult = await client.from("webcams").upsert(webcams, { onConflict: "id" });
  throwOnError("Webcam write failed", webcamResult.error);
}

async function main() {
  const validation = validateContentCatalog(candidates, BEACH_SLUGS);
  if (validation.issues.length > 0) {
    console.error(JSON.stringify({ mode: "rejected", issues: validation.issues }, null, 2));
    process.exitCode = 1;
    return;
  }

  const checkedAt = new Date();
  const nextCheckAt = addDays(checkedAt, CHECK_INTERVAL_DAYS);
  const expiresAt = nextCheckAt;
  const { parking, webcams, media } = validation.catalog;
  const mediaOnly = process.argv.includes("--media-only");

  if (!process.argv.includes("--apply")) {
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          parking: parking.length,
          webcams: webcams.length,
          media: media.length,
          review_profiles: 0,
          media_only: mediaOnly,
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
  const sourceRecords = mediaOnly
    ? media.map((record) => ({
        ...record,
        source_name: record.provider,
        source_type: "media-provider",
      }))
    : [
        ...parking,
        ...webcams,
        ...media.map((record) => ({
          ...record,
          source_name: record.provider,
          source_type: "media-provider",
        })),
      ];
  const sourcesByKey = await loadOrCreateSources(
    client,
    beachesBySlug,
    sourceRecords,
    checkedAt.toISOString(),
    nextCheckAt,
  );
  const parkingRows = mediaOnly
    ? []
    : buildParkingRows(
        parking,
        beachesBySlug,
        sourcesByKey,
        checkedAt.toISOString(),
        expiresAt,
      );
  const mediaRows = buildMediaRows(media, beachesBySlug, sourcesByKey, expiresAt);
  const webcamRows = mediaOnly
    ? []
    : buildWebcamRows(
        webcams,
        beachesBySlug,
        sourcesByKey,
        checkedAt.toISOString(),
        nextCheckAt,
      );

  await applyRows(client, parkingRows, mediaRows, webcamRows);
  console.log(
    JSON.stringify(
      {
        mode: "applied",
        parking: parkingRows.length,
        webcams: webcamRows.length,
        media: mediaRows.length,
        sources: sourcesByKey.size,
        review_profiles: 0,
        media_only: mediaOnly,
        all_draft: true,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Structured content import failed";
  console.error(message);
  process.exitCode = 1;
});
