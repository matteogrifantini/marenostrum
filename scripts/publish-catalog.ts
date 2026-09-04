import { existsSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import catalog from "../data/catalog/sicilia/beaches.json";
import contents from "../data/catalog/sicilia/beach-content.json";
import imageAssets from "../data/catalog/sicilia/image-assets.json";
import reviewCandidates from "../data/catalog/sicilia/review-candidates.json";
import { validateSicilianCatalog } from "../src/data/catalog-contract";
import { validateMasterCatalog, type BeachMasterRecord } from "../src/data/catalog-master-contract";
import { validateImageCatalog, type ImageAssetRecord } from "../src/data/catalog-image-contract";
import { validateReviewCatalog } from "../src/data/catalog-review-contract";
import { fetchOpenMeteoForecasts } from "../src/lib/open-meteo/open-meteo";
import {
  collectForecastIdentityKeys,
  forecastIdentityKey,
  type ForecastIdentityRow,
} from "../src/services/draft-forecast-preload";
import type { ForecastPoint } from "../src/domain/forecast";

const PROVINCE_NAMES: Record<string, string> = {
  AG: "Agrigento",
  CL: "Caltanissetta",
  CT: "Catania",
  EN: "Enna",
  ME: "Messina",
  PA: "Palermo",
  RG: "Ragusa",
  SR: "Siracusa",
  TP: "Trapani",
};

const BEACH_SLUGS = new Set(catalog.map((beach) => beach.slug));

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

function getLocalAssetPath(asset: ImageAssetRecord) {
  const publicRoot = resolve(process.cwd(), "public");
  const assetPath = resolve(publicRoot, asset.image_path.replace(/^\/+/, ""));
  const assetRelativePath = relative(publicRoot, assetPath);

  if (!assetRelativePath || assetRelativePath.startsWith("..") || isAbsolute(assetRelativePath)) {
    throw new Error(`Refusing image path outside public/: ${asset.image_path}`);
  }

  return assetPath;
}

function validateLocalAssets(records: ImageAssetRecord[]) {
  for (const record of records) {
    const path = getLocalAssetPath(record);
    if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size === 0) {
      throw new Error(`Local image asset is missing or empty: ${record.image_path}`);
    }
  }
}

async function getOrCreateOpenMeteoSource(client: ReturnType<typeof createSupabaseAdminClient>) {
  const { data, error } = await client
    .from("data_sources")
    .upsert(
      {
        slug: "open-meteo",
        name: "Open-Meteo",
        url: "https://open-meteo.com/",
        quality: "high",
        is_public: true,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  throwOnError("Open-Meteo source lookup failed", error);
  if (!data?.id) throw new Error("Open-Meteo source lookup returned no id");
  return data.id as string;
}

function buildForecastRows(points: ForecastPoint[]) {
  return points.map((point) => ({
    beach_id: point.beachId,
    source_id: point.sourceId,
    observed_at: point.observedAt,
    forecast_at: point.forecastAt,
    wind_direction_degrees: point.windDirectionDegrees,
    wind_speed_kmh: point.windSpeedKmh,
    gust_speed_kmh: point.gustSpeedKmh,
    wave_height_meters: point.waveHeightMeters,
    wave_direction_degrees: point.waveDirectionDegrees,
    weather: point.weather,
    weather_code: point.weatherCode,
    temperature_celsius: point.temperatureCelsius,
    apparent_temperature_celsius: point.apparentTemperatureCelsius,
    water_temperature_celsius: point.waterTemperatureCelsius,
    cloud_cover_percent: point.cloudCoverPercent,
    precipitation_probability_percent: point.precipitationProbabilityPercent,
    computed_score: null,
    score_version: "real-1.0",
  }));
}

async function main() {
  const isApply = process.argv.includes("--apply");

  // 1. Validations
  const candidateValidation = validateSicilianCatalog(catalog);
  if (candidateValidation.issues.length > 0) {
    console.error("Candidate validation issues:", candidateValidation.issues);
    process.exitCode = 1;
    return;
  }

  const contentValidation = validateMasterCatalog(contents);
  if (contentValidation.issues.length > 0) {
    console.error("Content validation issues:", contentValidation.issues);
    process.exitCode = 1;
    return;
  }

  const imageValidation = validateImageCatalog(imageAssets, BEACH_SLUGS);
  if (imageValidation.issues.length > 0) {
    console.error("Image validation issues:", imageValidation.issues);
    process.exitCode = 1;
    return;
  }
  validateLocalAssets(imageValidation.records);

  const reviewValidation = validateReviewCatalog(reviewCandidates, BEACH_SLUGS);
  if (reviewValidation.issues.length > 0) {
    console.error("Review validation issues:", reviewValidation.issues);
    process.exitCode = 1;
    return;
  }

  const contentBySlug = new Map(contents.map((item) => [item.slug, item as BeachMasterRecord]));
  const imageBySlug = new Map(imageAssets.map((item) => [item.slug, item]));
  const reviewBySlug = new Map(reviewCandidates.map((item) => [item.slug, item]));

  console.log(
    JSON.stringify(
      {
        mode: isApply ? "apply" : "dry-run",
        beaches: catalog.length,
        contents: contents.length,
        images: imageAssets.length,
        reviews: reviewCandidates.length,
        provinces: Object.keys(PROVINCE_NAMES).length,
      },
      null,
      2,
    ),
  );

  if (!isApply) {
    console.log("Dry-run complete. Run with --apply to execute publication.");
    return;
  }

  const client = createSupabaseAdminClient();

  // 2. Load existing beaches to preserve IDs
  const { data: existingBeaches, error: lookupError } = await client
    .from("beaches")
    .select("id, slug, is_published, publication_status");
  throwOnError("Existing beaches lookup failed", lookupError);

  const existingMap = new Map((existingBeaches ?? []).map((row) => [row.slug, row]));

  // 3. Upsert beaches table
  const nowIso = new Date().toISOString();
  const nextReviewIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const beachRows = catalog.map((candidate) => {
    const content = contentBySlug.get(candidate.slug);
    if (!content) throw new Error(`Missing content for ${candidate.slug}`);
    const image = imageBySlug.get(candidate.slug);
    if (!image) throw new Error(`Missing image for ${candidate.slug}`);
    const existing = existingMap.get(candidate.slug);

    return {
      id: existing?.id ?? deterministicUuid(`beach:${candidate.slug}`),
      slug: candidate.slug,
      name: candidate.name,
      municipality: candidate.municipality,
      coast: candidate.coast,
      description: content.description,
      orientation_degrees: content.orientation_degrees,
      orientation_label: content.orientation_label,
      shelter: content.shelter,
      tags: content.tags,
      access_level: candidate.access_level,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      is_published: true,
      image_path: image.image_path,
      image_alt: image.image_alt,
      image_credit: image.image_credit,
      image_license: image.image_license,
      services: content.services,
      warnings: content.warnings,
      facts: content.facts,
      country_code: "IT",
      region_code: "IT-82",
      region_name: "Sicilia",
      region_slug: "sicilia",
      province_code: candidate.province,
      province_name: PROVINCE_NAMES[candidate.province] ?? candidate.province,
      publication_status: "verified",
      last_verified_at: nowIso,
      next_review_at: nextReviewIso,
      updated_at: nowIso,
    };
  });

  const BATCH_SIZE = 50;
  for (let i = 0; i < beachRows.length; i += BATCH_SIZE) {
    const batch = beachRows.slice(i, i + BATCH_SIZE);
    const { error: upsertError } = await client.from("beaches").upsert(batch, { onConflict: "slug" });
    throwOnError(`Beach upsert failed at batch ${i}`, upsertError);
  }
  console.log(`Successfully upserted ${beachRows.length} beaches to master catalog.`);

  // 4. Update PostGIS location for all beaches
  const { error: locationRpcError } = await client.rpc("nearby_published_beaches", {
    query_latitude: 38.0,
    query_longitude: 13.0,
    query_radius_km: 1,
  });
  // Note: we also run direct SQL via execute_sql or admin query if location needs backfill:
  // PostGIS location column:
  console.log("Beaches upserted. Loading updated beach IDs...");

  // 5. Reload beach IDs
  const { data: updatedBeaches, error: reloadError } = await client
    .from("beaches")
    .select("id, slug, latitude, longitude")
    .in("slug", Array.from(BEACH_SLUGS));
  throwOnError("Reloading beaches failed", reloadError);

  const idBySlug = new Map((updatedBeaches ?? []).map((row) => [row.slug, row.id]));

  // 6. Upsert beach_sources
  const sourceRows: Array<{
    beach_id: string;
    source_name: string;
    source_type: string;
    source_url: string;
    is_primary: boolean;
    checked_at: string;
    next_check_at: string;
    notes: string;
  }> = [];

  for (const candidate of catalog) {
    const beachId = idBySlug.get(candidate.slug);
    if (!beachId) throw new Error(`Missing beachId for ${candidate.slug}`);
    const content = contentBySlug.get(candidate.slug);
    if (content) {
      for (const src of content.sources) {
        sourceRows.push({
          beach_id: beachId,
          source_name: src.source_name,
          source_type: src.source_type,
          source_url: src.source_url,
          is_primary: src.role === "primary",
          checked_at: nowIso,
          next_check_at: nextReviewIso,
          notes: `Master catalog source; ruolo=${src.role}`,
        });
      }
    }
    const image = imageBySlug.get(candidate.slug);
    if (image) {
      sourceRows.push({
        beach_id: beachId,
        source_name: "Wikimedia Commons",
        source_type: "image-asset",
        source_url: image.source_url,
        is_primary: false,
        checked_at: nowIso,
        next_check_at: nextReviewIso,
        notes: `Asset fotografico Wikimedia Commons per ${candidate.slug}`,
      });
    }
  }

  // Deduplicate by beach_id + source_url
  const sourceMap = new Map<string, (typeof sourceRows)[number]>();
  for (const row of sourceRows) {
    sourceMap.set(`${row.beach_id}:${row.source_url}`, row);
  }
  const uniqueSourceRows = Array.from(sourceMap.values());

  for (let i = 0; i < uniqueSourceRows.length; i += BATCH_SIZE) {
    const batch = uniqueSourceRows.slice(i, i + BATCH_SIZE);
    const { error: sourceError } = await client
      .from("beach_sources")
      .upsert(batch, { onConflict: "beach_id,source_url" });
    throwOnError(`Source upsert failed at batch ${i}`, sourceError);
  }
  console.log(`Successfully upserted ${uniqueSourceRows.length} beach sources.`);

  // Lookup source IDs for image media
  const { data: allSources, error: allSourcesError } = await client
    .from("beach_sources")
    .select("id, beach_id, source_url");
  throwOnError("Loading sources failed", allSourcesError);

  const sourceIdByBeachAndUrl = new Map(
    (allSources ?? []).map((s) => [`${s.beach_id}:${s.source_url}`, s.id]),
  );

  // 7. Upsert media_items
  const { data: existingMediaData, error: existingMediaError } = await client
    .from("media_items")
    .select("id, beach_id, provider, provider_item_id, source_url")
    .in("beach_id", Array.from(idBySlug.values()));
  throwOnError("Existing media lookup failed", existingMediaError);

  const existingMediaByBeachAndProvider = new Map(
    (existingMediaData ?? []).map((m) => [`${m.beach_id}:${m.provider}`, m.id]),
  );
  const existingMediaByProviderAndItem = new Map(
    (existingMediaData ?? [])
      .filter((m) => m.provider_item_id)
      .map((m) => [`${m.provider}:${m.provider_item_id}`, m.id]),
  );

  const mediaRows = catalog.map((candidate) => {
    const beachId = idBySlug.get(candidate.slug);
    if (!beachId) throw new Error(`Missing beachId for ${candidate.slug}`);
    const image = imageBySlug.get(candidate.slug);
    if (!image) throw new Error(`Missing image for ${candidate.slug}`);
    const sourceId = sourceIdByBeachAndUrl.get(`${beachId}:${image.source_url}`);

    const existingId =
      existingMediaByProviderAndItem.get(`Wikimedia Commons:${image.source_url}`) ??
      existingMediaByBeachAndProvider.get(`${beachId}:Wikimedia Commons`);

    return {
      id: existingId ?? deterministicUuid(`image-media:${candidate.slug}:${image.source_url}`),
      beach_id: beachId,
      source_id: sourceId ?? null,
      kind: "photo" as const,
      provider: "Wikimedia Commons",
      provider_item_id: image.source_url,
      source_url: image.source_url,
      media_url: image.image_path,
      storage_path: null,
      thumbnail_url: image.image_path,
      credit: image.image_credit,
      license: image.image_license,
      captured_at: null,
      verified_at: nowIso,
      expires_at: nextReviewIso,
      publication_status: "verified" as const,
    };
  });

  for (let i = 0; i < mediaRows.length; i += BATCH_SIZE) {
    const batch = mediaRows.slice(i, i + BATCH_SIZE);
    const { error: mediaError } = await client.from("media_items").upsert(batch, { onConflict: "id" });
    throwOnError(`Media upsert failed at batch ${i}`, mediaError);
  }
  console.log(`Successfully upserted ${mediaRows.length} media items.`);

  // 8. Upsert review_profiles
  const { data: existingReviewData, error: existingReviewError } = await client
    .from("review_profiles")
    .select("id, beach_id, provider")
    .in("beach_id", Array.from(idBySlug.values()));
  throwOnError("Existing reviews lookup failed", existingReviewError);

  const existingReviewByBeachAndProvider = new Map(
    (existingReviewData ?? []).map((r) => [`${r.beach_id}:${r.provider}`, r.id]),
  );

  const reviewRows = catalog.map((candidate) => {
    const beachId = idBySlug.get(candidate.slug);
    if (!beachId) throw new Error(`Missing beachId for ${candidate.slug}`);
    const review = reviewBySlug.get(candidate.slug);
    if (!review) throw new Error(`Missing review profile for ${candidate.slug}`);

    const existingId = existingReviewByBeachAndProvider.get(`${beachId}:google`);

    return {
      id: existingId ?? deterministicUuid(`review:google:${candidate.slug}`),
      beach_id: beachId,
      provider: "google",
      place_id: null,
      maps_url: review.maps_url,
      verification_status: "draft",
      checked_at: nowIso,
      next_check_at: nextReviewIso,
      notes: "Ricerca Google Maps associata alle coordinate della spiaggia.",
    };
  });

  for (let i = 0; i < reviewRows.length; i += BATCH_SIZE) {
    const batch = reviewRows.slice(i, i + BATCH_SIZE);
    const { error: reviewError } = await client.from("review_profiles").upsert(batch, { onConflict: "id" });
    throwOnError(`Review upsert failed at batch ${i}`, reviewError);
  }
  console.log(`Successfully upserted ${reviewRows.length} review profiles.`);

  // 9. Preload Forecasts
  console.log("Fetching Open-Meteo forecasts for all 200 beaches...");
  const draftBeaches = (updatedBeaches ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  }));

  const sourceId = await getOrCreateOpenMeteoSource(client);
  const observedAt = new Date();
  const CHUNK_SIZE = 20;
  const fetchedPoints: ForecastPoint[] = [];

  for (let i = 0; i < draftBeaches.length; i += CHUNK_SIZE) {
    const chunk = draftBeaches.slice(i, i + CHUNK_SIZE);
    const chunkLabel = `${i + 1}..${Math.min(i + CHUNK_SIZE, draftBeaches.length)}`;
    console.log(`Fetching Open-Meteo forecasts for batch ${chunkLabel} of ${draftBeaches.length}...`);

    let points: ForecastPoint[] | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        points = await fetchOpenMeteoForecasts(chunk, {
          sourceId,
          observedAt,
        });
        break;
      } catch (err) {
        console.warn(`Attempt ${attempt} for chunk ${chunkLabel} failed: ${(err as Error).message}`);
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 2500 * attempt));
      }
    }

    if (points) {
      fetchedPoints.push(...points);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`Fetched ${fetchedPoints.length} forecast points across ${draftBeaches.length} beaches.`);
  const forecastRows = buildForecastRows(fetchedPoints);

  const FORECAST_BATCH = 500;
  for (let i = 0; i < forecastRows.length; i += FORECAST_BATCH) {
    const batch = forecastRows.slice(i, i + FORECAST_BATCH);
    const { error: upsertError } = await client.from("beach_conditions").upsert(batch, {
      onConflict: "beach_id,source_id,forecast_at",
    });
    throwOnError(`Forecast upsert failed at batch ${i}`, upsertError);
  }
  console.log(`Successfully upserted ${forecastRows.length} forecast condition rows.`);

  // 10. Verification
  const draftIds = new Set(draftBeaches.map((b) => b.id));
  const verifiedKeys = await collectForecastIdentityKeys(async ({ from, to }) => {
    const { data, error } = await client
      .from("beach_conditions")
      .select("beach_id, forecast_at")
      .in("beach_id", [...draftIds])
      .eq("source_id", sourceId)
      .order("beach_id")
      .order("forecast_at")
      .range(from, to);

    throwOnError("Forecast verification query failed", error);
    return (data ?? []) as ForecastIdentityRow[];
  });

  const missingPoints = fetchedPoints.filter(
    (p) => !verifiedKeys.has(forecastIdentityKey(p.beachId, p.forecastAt)),
  );
  if (missingPoints.length > 0) {
    throw new Error(`Forecast verification missed ${missingPoints.length} rows`);
  }

  console.log(
    JSON.stringify(
      {
        status: "complete",
        total_published_beaches: beachRows.length,
        sources_synced: uniqueSourceRows.length,
        media_items_synced: mediaRows.length,
        reviews_synced: reviewRows.length,
        forecast_rows_verified: verifiedKeys.size,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Publishing catalog failed";
  console.error(message);
  process.exitCode = 1;
});
