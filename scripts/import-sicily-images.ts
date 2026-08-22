import { existsSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import beaches from "../data/catalog/sicilia/beaches.json";
import imageAssets from "../data/catalog/sicilia/image-assets.json";
import {
  validateSicilianImageCatalog,
  type SicilianImageAssetRecord,
} from "../src/data/catalog-image-contract";

const BEACH_SLUGS = new Set(beaches.map((beach) => beach.slug));
const IMAGE_FIELDS = ["image_path", "image_alt", "image_credit", "image_license"] as const;

type ImageField = (typeof IMAGE_FIELDS)[number];

type BeachRow = {
  id: string;
  slug: string;
  image_path: string | null;
  image_alt: string | null;
  image_credit: string | null;
  image_license: string | null;
  is_published: boolean;
  publication_status: string;
};

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

async function loadDraftBeaches(
  client: ReturnType<typeof createSupabaseAdminClient>,
  records: SicilianImageAssetRecord[],
) {
  const { data, error } = await client
    .from("beaches")
    .select("id, slug, image_path, image_alt, image_credit, image_license, is_published, publication_status")
    .in("slug", records.map((record) => record.slug));
  throwOnError("Beach lookup failed", error);

  const rows = (data ?? []) as BeachRow[];
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
  const missing = records
    .map((record) => record.slug)
    .filter((slug) => !rowsBySlug.has(slug));
  if (missing.length > 0) {
    throw new Error(`Refusing image import: beach rows are missing: ${missing.join(", ")}`);
  }

  const protectedRows = rows.filter(
    (row) => row.is_published || row.publication_status !== "draft",
  );
  if (protectedRows.length > 0) {
    throw new Error(
      `Refusing image import for protected beach rows: ${protectedRows.map((row) => row.slug).join(", ")}`,
    );
  }

  return rowsBySlug;
}

function isBlank(value: string | null) {
  return value === null || value.trim() === "";
}

function getExistingAction(
  row: BeachRow,
  asset: SicilianImageAssetRecord,
  allowDraftReplace: boolean,
) {
  const isExact = IMAGE_FIELDS.every((field) => row[field] === asset[field]);
  if (isExact) return "skip" as const;

  const isEmpty = IMAGE_FIELDS.every((field) => isBlank(row[field]));
  if (isEmpty) return "update" as const;

  if (allowDraftReplace) return "replace" as const;

  throw new Error(
    `Refusing to overwrite existing image metadata for ${row.slug}; current fields are not empty or identical to the manifest`,
  );
}

function buildUpdatePlan(
  rowsBySlug: Map<string, BeachRow>,
  records: SicilianImageAssetRecord[],
  allowDraftReplace: boolean,
) {
  return records.map((asset) => {
    const row = rowsBySlug.get(asset.slug);
    if (!row) throw new Error(`Beach row missing for ${asset.slug}`);
    return { asset, row, action: getExistingAction(row, asset, allowDraftReplace) };
  });
}

async function applyImageMetadata(
  client: ReturnType<typeof createSupabaseAdminClient>,
  plan: ReturnType<typeof buildUpdatePlan>,
) {
  let updated = 0;
  let replaced = 0;
  let skipped = 0;

  for (const item of plan) {
    if (item.action === "skip") {
      skipped += 1;
      continue;
    }

    const update = Object.fromEntries(
      IMAGE_FIELDS.map((field) => [field, item.asset[field]]),
    ) as Pick<BeachRow, ImageField>;
    const { data, error } = await client
      .from("beaches")
      .update(update)
      .eq("id", item.row.id)
      .eq("is_published", false)
      .eq("publication_status", "draft")
      .select("id")
      .single();
    throwOnError(`Image metadata write failed for ${item.asset.slug}`, error);
    if (!data) throw new Error(`Image metadata write returned no row for ${item.asset.slug}`);
    if (item.action === "replace") replaced += 1;
    else updated += 1;
  }

  return { updated, replaced, skipped };
}

async function verifyImageMetadata(
  client: ReturnType<typeof createSupabaseAdminClient>,
  records: SicilianImageAssetRecord[],
) {
  const { data, error } = await client
    .from("beaches")
    .select("slug, image_path, image_alt, image_credit, image_license, is_published, publication_status")
    .in("slug", records.map((record) => record.slug));
  throwOnError("Image verification lookup failed", error);

  const rowsBySlug = new Map((data ?? []).map((row) => [row.slug, row as BeachRow]));
  for (const asset of records) {
    const row = rowsBySlug.get(asset.slug);
    if (!row) throw new Error(`Image verification row missing for ${asset.slug}`);
    if (row.is_published || row.publication_status !== "draft") {
      throw new Error(`Image verification found protected beach row: ${asset.slug}`);
    }
    for (const field of IMAGE_FIELDS) {
      if (row[field] !== asset[field]) {
        throw new Error(`Image verification mismatch for ${asset.slug}.${field}`);
      }
    }
  }

  return records.length;
}

async function main() {
  const validation = validateSicilianImageCatalog(imageAssets, BEACH_SLUGS);
  if (validation.issues.length > 0) {
    console.error(JSON.stringify({ mode: "rejected", issues: validation.issues }, null, 2));
    process.exitCode = 1;
    return;
  }

  validateLocalAssets(validation.records);

  if (!process.argv.includes("--apply")) {
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          assets: validation.records.length,
          local_files: validation.records.length,
          writes: 0,
          all_draft: true,
        },
        null,
        2,
      ),
    );
    return;
  }

  const client = createSupabaseAdminClient();
  const rowsBySlug = await loadDraftBeaches(client, validation.records);
  const allowDraftReplace = process.argv.includes("--replace-draft");
  const plan = buildUpdatePlan(rowsBySlug, validation.records, allowDraftReplace);
  const applied = await applyImageMetadata(client, plan);
  const verified = await verifyImageMetadata(client, validation.records);

  console.log(
    JSON.stringify(
      {
        mode: "applied",
        assets: validation.records.length,
        ...applied,
        replace_draft: allowDraftReplace,
        verified,
        all_draft: true,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Image metadata import failed";
  console.error(message);
  process.exitCode = 1;
});
