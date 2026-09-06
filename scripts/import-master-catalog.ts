import { createClient } from "@supabase/supabase-js";
import candidates from "../data/catalog/sicilia/beaches.json";
import contents from "../data/catalog/sicilia/beach-content.json";
import {
  buildMasterDraftImport,
  type MasterDraftBeachInsert,
  type MasterDraftContentSource,
} from "../src/services/catalog-master-import";

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin configuration is missing");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function applyDraftImport(
  client: ReturnType<typeof createAdminClient>,
  beaches: MasterDraftBeachInsert[],
  sources: MasterDraftContentSource[],
) {
  const slugs = beaches.map((beach) => beach.slug);
  const existingResult = await client
    .from("beaches")
    .select("slug, is_published, publication_status")
    .in("slug", slugs);

  if (existingResult.error) {
    throw new Error(`Existing beach lookup failed: ${existingResult.error.message}`);
  }

  const protectedRows = (existingResult.data ?? []).filter(
    (row) => row.is_published || row.publication_status !== "draft",
  );

  if (protectedRows.length > 0) {
    throw new Error(
      `Refusing to overwrite protected beach rows: ${protectedRows.map((row) => row.slug).join(", ")}`,
    );
  }

  const beachResult = await client.from("beaches").upsert(beaches, { onConflict: "slug" });
  if (beachResult.error) {
    throw new Error(`Beach draft write failed: ${beachResult.error.message}`);
  }

  const idsResult = await client.from("beaches").select("id, slug").in("slug", slugs);
  if (idsResult.error) {
    throw new Error(`Beach id lookup failed: ${idsResult.error.message}`);
  }

  const idBySlug = new Map((idsResult.data ?? []).map((row) => [row.slug, row.id]));
  const sourceRows = sources.map(({ beach_slug, ...source }) => {
    const beachId = idBySlug.get(beach_slug);
    if (!beachId) throw new Error(`Beach id missing for ${beach_slug}`);
    return { beach_id: beachId, ...source };
  });

  const primaryResult = await client
    .from("beach_sources")
    .select("beach_id, source_url, is_primary")
    .in("beach_id", Array.from(idBySlug.values()));
  if (primaryResult.error) {
    throw new Error(`Existing source lookup failed: ${primaryResult.error.message}`);
  }

  const incomingPrimaryByBeach = new Map(
    sourceRows.filter((source) => source.is_primary).map((source) => [source.beach_id, source.source_url]),
  );
  const conflictingPrimary = (primaryResult.data ?? []).find(
    (source) =>
      source.is_primary &&
      incomingPrimaryByBeach.has(source.beach_id) &&
      incomingPrimaryByBeach.get(source.beach_id) !== source.source_url,
  );

  if (conflictingPrimary) {
    throw new Error(`Refusing to replace existing primary source for ${conflictingPrimary.beach_id}`);
  }

  const sourceResult = await client
    .from("beach_sources")
    .upsert(sourceRows, { onConflict: "beach_id,source_url" });
  if (sourceResult.error) {
    throw new Error(`Beach source write failed: ${sourceResult.error.message}`);
  }

  return { beaches: beaches.length, sources: sourceRows.length };
}

async function main() {
  const result = buildMasterDraftImport({
    candidates,
    contents,
  });

  if (result.blocked.length > 0) {
    console.error(
      JSON.stringify(
        {
          mode: "rejected",
          beaches: result.beaches.length,
          sources: result.sources.length,
          blocked: result.blocked,
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  if (!process.argv.includes("--apply")) {
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          beaches: result.beaches.length,
          sources: result.sources.length,
          is_published: false,
          publication_status: "draft",
        },
        null,
        2,
      ),
    );
    return;
  }

  const applied = await applyDraftImport(createAdminClient(), result.beaches, result.sources);
  console.log(JSON.stringify({ mode: "applied", ...applied, is_published: false }, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Master catalog import failed";
  console.error(message);
  process.exitCode = 1;
});
