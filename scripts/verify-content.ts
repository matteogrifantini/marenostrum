import { createClient } from "@supabase/supabase-js";
import beaches from "../data/catalog/sicilia/beaches.json";
import candidates from "../data/catalog/sicilia/content-candidates.json";
import verification from "../data/catalog/sicilia/content-verification.json";
import {
  validateContentCatalog,
  type ParkingContentRecord,
} from "../src/data/catalog-content-contract";
import {
  validateWebcamVerificationCatalog,
  type WebcamVerificationRecord,
} from "../src/data/catalog-content-verification";

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
};

type ParkingRow = {
  id: string;
  beach_id: string;
  source_id: string | null;
  content_status: "draft" | "verified" | "stale" | "archived";
};

type WebcamRow = {
  id: string;
  beach_id: string;
  source_id: string | null;
  content_status: "draft" | "verified" | "stale" | "archived";
};

type OsmElement = {
  type: string;
  id: number;
  tags?: Record<string, string>;
};

type OsmReference = {
  type: "way" | "node";
  id: string;
};

type OsmResponse = {
  elements?: OsmElement[];
};

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString();
}

function throwOnError(context: string, error: { message: string } | null) {
  if (error) throw new Error(`${context}: ${error.message}`);
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

function osmReference(sourceUrl: string): OsmReference {
  const parts = new URL(sourceUrl).pathname.split("/").filter(Boolean);
  const type = parts.at(-2);
  const id = parts.at(-1);

  if ((type !== "way" && type !== "node") || !id || !/^\d+$/.test(id)) {
    throw new Error(`Unsupported OpenStreetMap source URL: ${sourceUrl}`);
  }

  return { type: type as OsmReference["type"], id };
}

async function fetchOverpassElements(references: OsmReference[]) {
  const idsByType = new Map<"way" | "node", string[]>();
  for (const reference of references) {
    const ids = idsByType.get(reference.type) ?? [];
    ids.push(reference.id);
    idsByType.set(reference.type, ids);
  }

  const clauses = Array.from(idsByType.entries()).map(
    ([type, ids]) => `${type}(id:${ids.join(",")});`,
  );
  const query = `[out:json][timeout:25];(${clauses.join("")});out body;`;
  const overpassUrl = new URL("https://overpass-api.de/api/interpreter");
  overpassUrl.searchParams.set("data", query);
  const response = await fetch(overpassUrl, {
    headers: { "user-agent": "MareNostrum catalog verifier" },
    signal: AbortSignal.timeout(45_000),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const parsed = JSON.parse(body) as OsmResponse;
  const elements = new Map(
    (parsed.elements ?? []).map((element) => [`${element.type}/${element.id}`, element]),
  );
  const missing = references.filter((reference) => !elements.has(`${reference.type}/${reference.id}`));
  if (missing.length > 0) {
    throw new Error(`elements missing: ${missing.map((reference) => `${reference.type}/${reference.id}`).join(",")}`);
  }

  return elements;
}

async function fetchOsmElements(records: ParkingContentRecord[]) {
  const references = records.map((record) => osmReference(record.source_url));
  const byReference = new Map<string, OsmElement>();
  const grouped = new Map<"way" | "node", string[]>();

  for (const reference of references) {
    const ids = grouped.get(reference.type) ?? [];
    ids.push(reference.id);
    grouped.set(reference.type, ids);
  }

  try {
    for (const [type, ids] of grouped) {
      const plural = `${type}s`;
      const query = ids.join(",");
      const paths = [
        `https://api.openstreetmap.org/api/0.6/${plural}.json?${plural}=${query}`,
        `https://www.openstreetmap.org/api/0.6/${plural}.json?${plural}=${query}`,
      ];
      let lastError = "unknown response";

      for (const path of paths) {
        try {
          const response = await fetch(path, { signal: AbortSignal.timeout(15_000) });
          const body = await response.text();
          if (!response.ok) {
            lastError = `HTTP ${response.status}`;
            continue;
          }

          let parsed: OsmResponse;
          try {
            parsed = JSON.parse(body) as OsmResponse;
          } catch {
            lastError = "response was not JSON";
            continue;
          }

          for (const element of parsed.elements ?? []) {
            if (element.type === type) byReference.set(`${type}/${element.id}`, element);
          }
          break;
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
        }
      }

      const missing = ids.filter((id) => !byReference.has(`${type}/${id}`));
      if (missing.length > 0) {
        throw new Error(`OpenStreetMap lookup failed for ${type}/${missing.join(",")}: ${lastError}`);
      }
    }

    return byReference;
  } catch {
    return fetchOverpassElements(references);
  }
}

async function verifyParkingCandidates(records: ParkingContentRecord[]) {
  const elements = await fetchOsmElements(records);
  const verified: Array<{ record: ParkingContentRecord; element: OsmElement }> = [];

  for (const record of records) {
    const reference = osmReference(record.source_url);
    const element = elements.get(`${reference.type}/${reference.id}`);
    if (!element) throw new Error(`OpenStreetMap element is missing: ${record.source_url}`);
    if (element.tags?.amenity !== "parking") {
      throw new Error(`OpenStreetMap source is not tagged amenity=parking: ${record.source_url}`);
    }
    verified.push({ record, element });
  }

  return verified;
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
    throw new Error(`Refusing content verification: beach rows are missing: ${missing.join(", ")}`);
  }

  const protectedRows = rows.filter(
    (row) => row.is_published || row.publication_status !== "draft",
  );
  if (protectedRows.length > 0) {
    throw new Error(
      `Refusing content verification for protected beach rows: ${protectedRows.map((row) => row.slug).join(", ")}`,
    );
  }

  return rowsBySlug;
}

async function loadSources(
  client: ReturnType<typeof createSupabaseAdminClient>,
  beachesBySlug: Map<string, BeachRow>,
) {
  const beachIds = Array.from(beachesBySlug.values()).map((beach) => beach.id);
  const { data, error } = await client
    .from("beach_sources")
    .select("id, beach_id, source_url")
    .in("beach_id", beachIds);
  throwOnError("Source lookup failed", error);
  return (data ?? []) as SourceRow[];
}

async function loadContentRows(
  client: ReturnType<typeof createSupabaseAdminClient>,
  beachesBySlug: Map<string, BeachRow>,
  sources: SourceRow[],
) {
  const beachIds = Array.from(beachesBySlug.values()).map((beach) => beach.id);
  const sourceIds = sources.map((source) => source.id);
  const [parkingResult, webcamResult] = await Promise.all([
    client
      .from("parking_facilities")
      .select("id, beach_id, source_id, content_status")
      .in("beach_id", beachIds)
      .in("source_id", sourceIds),
    client
      .from("webcams")
      .select("id, beach_id, source_id, content_status")
      .in("beach_id", beachIds)
      .in("source_id", sourceIds),
  ]);
  throwOnError("Parking lookup failed", parkingResult.error);
  throwOnError("Webcam lookup failed", webcamResult.error);

  return {
    parking: (parkingResult.data ?? []) as ParkingRow[],
    webcams: (webcamResult.data ?? []) as WebcamRow[],
  };
}

function sourceKey(beachId: string, sourceUrl: string) {
  return `${beachId}:${sourceUrl}`;
}

function assertWritableStatus(status: ParkingRow["content_status"], label: string) {
  if (status !== "draft" && status !== "verified") {
    throw new Error(`Refusing to overwrite protected ${label} row with status ${status}`);
  }
}

async function applyVerifiedContent(
  client: ReturnType<typeof createSupabaseAdminClient>,
  beachesBySlug: Map<string, BeachRow>,
  sources: SourceRow[],
  parkingVerification: Array<{ record: ParkingContentRecord; element: OsmElement }>,
  webcamVerification: WebcamVerificationRecord[],
) {
  const sourceByKey = new Map(sources.map((source) => [sourceKey(source.beach_id, source.source_url), source]));
  const rows = await loadContentRows(client, beachesBySlug, sources);
  const parkingBySourceId = new Map(rows.parking.map((row) => [row.source_id, row]));
  const webcamBySourceId = new Map(rows.webcams.map((row) => [row.source_id, row]));
  const now = new Date();
  const checkedAt = now.toISOString();
  const nextCheckAt = addDays(now, CHECK_INTERVAL_DAYS);

  const parkingPlan = parkingVerification.map(({ record }) => {
    const beach = beachesBySlug.get(record.slug);
    if (!beach) throw new Error(`Beach id missing for parking ${record.slug}`);
    const source = sourceByKey.get(sourceKey(beach.id, record.source_url));
    if (!source) throw new Error(`Source row missing for parking ${record.slug}`);
    const row = parkingBySourceId.get(source.id);
    if (!row) throw new Error(`Parking row missing for ${record.slug}`);
    assertWritableStatus(row.content_status, `parking ${record.slug}`);
    return { row, record };
  });

  const webcamPlan = webcamVerification.map((record) => {
    const candidate = candidates.webcams.find((item) => item.source_url === record.source_url);
    if (!candidate) throw new Error(`Webcam candidate missing for ${record.source_url}`);
    const beach = beachesBySlug.get(candidate.slug);
    if (!beach) throw new Error(`Beach id missing for webcam ${candidate.slug}`);
    const source = sourceByKey.get(sourceKey(beach.id, record.source_url));
    if (!source) throw new Error(`Source row missing for webcam ${candidate.slug}`);
    const row = webcamBySourceId.get(source.id);
    if (!row) throw new Error(`Webcam row missing for ${candidate.slug}`);
    assertWritableStatus(row.content_status, `webcam ${candidate.slug}`);
    return { row, candidate, record };
  });

  for (const { row } of parkingPlan) {
    const { data, error } = await client
      .from("parking_facilities")
      .update({ content_status: "verified", checked_at: checkedAt, expires_at: nextCheckAt })
      .eq("id", row.id)
      .in("content_status", ["draft", "verified"])
      .select("id")
      .single();
    throwOnError("Parking verification write failed", error);
    if (!data) throw new Error(`Parking verification returned no row: ${row.id}`);
  }

  for (const { row, record } of webcamPlan) {
    const { data, error } = await client
      .from("webcams")
      .update({
        content_status: "verified",
        status: record.status,
        last_checked_at: checkedAt,
        next_check_at: nextCheckAt,
      })
      .eq("id", row.id)
      .in("content_status", ["draft", "verified"])
      .select("id")
      .single();
    throwOnError("Webcam verification write failed", error);
    if (!data) throw new Error(`Webcam verification returned no row: ${row.id}`);
  }

  const verifiedParkingIds = parkingPlan.map(({ row }) => row.id);
  const verifiedWebcamIds = webcamPlan.map(({ row }) => row.id);
  const [parkingAfter, webcamAfter] = await Promise.all([
    client.from("parking_facilities").select("id, content_status").in("id", verifiedParkingIds),
    client.from("webcams").select("id, content_status").in("id", verifiedWebcamIds),
  ]);
  throwOnError("Parking verification readback failed", parkingAfter.error);
  throwOnError("Webcam verification readback failed", webcamAfter.error);
  if ((parkingAfter.data ?? []).some((row) => row.content_status !== "verified")) {
    throw new Error("Parking verification readback found a non-verified row");
  }
  if ((webcamAfter.data ?? []).some((row) => row.content_status !== "verified")) {
    throw new Error("Webcam verification readback found a non-verified row");
  }

  return {
    parkingVerified: parkingPlan.length,
    webcamsVerified: webcamPlan.length,
    writes: parkingPlan.length + webcamPlan.length,
  };
}

async function main() {
  const contentValidation = validateContentCatalog(candidates, BEACH_SLUGS);
  if (contentValidation.issues.length > 0) {
    console.error(JSON.stringify({ mode: "rejected", issues: contentValidation.issues }, null, 2));
    process.exitCode = 1;
    return;
  }

  const webcamCandidateSources = new Set(contentValidation.catalog.webcams.map((record) => record.source_url));
  const webcamValidation = validateWebcamVerificationCatalog(
    verification.webcams,
    webcamCandidateSources,
  );
  if (webcamValidation.issues.length > 0) {
    console.error(JSON.stringify({ mode: "rejected", issues: webcamValidation.issues }, null, 2));
    process.exitCode = 1;
    return;
  }

  let parkingVerification: Array<{ record: ParkingContentRecord; element: OsmElement }>;
  try {
    parkingVerification = await verifyParkingCandidates(contentValidation.catalog.parking);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ mode: "rejected", source: "openstreetmap", error: message }, null, 2));
    process.exitCode = 1;
    return;
  }

  const deferredWebcams = contentValidation.catalog.webcams.length - webcamValidation.records.length;
  const mediaDeferred = contentValidation.catalog.media.length;
  const checkedAt = new Date().toISOString();

  if (!process.argv.includes("--apply")) {
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          checked_at: checkedAt,
          parking_candidates: contentValidation.catalog.parking.length,
          parking_osm_verified: parkingVerification.length,
          webcam_candidates: contentValidation.catalog.webcams.length,
          webcam_verified: webcamValidation.records.length,
          webcam_deferred: deferredWebcams,
          media_deferred: mediaDeferred,
          writes: 0,
        },
        null,
        2,
      ),
    );
    return;
  }

  const client = createSupabaseAdminClient();
  const beachesBySlug = await loadDraftBeaches(client);
  const sources = await loadSources(client, beachesBySlug);
  const applied = await applyVerifiedContent(
    client,
    beachesBySlug,
    sources,
    parkingVerification,
    webcamValidation.records,
  );

  console.log(
    JSON.stringify(
      {
        mode: "applied",
        checked_at: checkedAt,
        parking_candidates: contentValidation.catalog.parking.length,
        parking_verified: applied.parkingVerified,
        webcam_candidates: contentValidation.catalog.webcams.length,
        webcam_verified: applied.webcamsVerified,
        webcam_deferred: deferredWebcams,
        media_deferred: mediaDeferred,
        writes: applied.writes,
        all_beaches_draft: true,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Content verification failed";
  console.error(message);
  process.exitCode = 1;
});
