import { createClient } from "@supabase/supabase-js";
import beaches from "../data/catalog/sicilia/beaches.json";
import {
  evaluateBeachPublicationReadiness,
  type BeachPublicationReadinessInput,
} from "../src/services/publication-readiness";

type LiveBeachRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  image_path: string | null;
  image_alt: string | null;
  image_credit: string | null;
  image_license: string | null;
  is_published: boolean;
  publication_status: string;
};

type SourceRow = {
  beach_id: string;
  is_primary: boolean;
};

type StatusRow = {
  beach_id: string;
  content_status: string;
};

type MediaStatusRow = {
  beach_id: string;
  publication_status: string;
};

type ReviewStatusRow = {
  beach_id: string;
  verification_status: string;
};

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

function countByBeach<T extends { beach_id: string }>(rows: T[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.beach_id, (counts.get(row.beach_id) ?? 0) + 1);
  }

  return counts;
}

function countVerifiedByBeach<T extends { beach_id: string }>(
  rows: T[],
  statusKey: keyof T,
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const status = row[statusKey];
    if (status !== "verified" && status !== "stale") continue;
    counts.set(row.beach_id, (counts.get(row.beach_id) ?? 0) + 1);
  }

  return counts;
}

type ForecastRow = { beach_id: string };

async function readForecastRowsForBeach(
  client: ReturnType<typeof createSupabaseAdminClient>,
  beachId: string,
): Promise<ForecastRow[]> {
  const pageSize = 1000;
  const rows: ForecastRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("beach_conditions")
      .select("beach_id")
      .eq("beach_id", beachId)
      .range(from, from + pageSize - 1);

    throwOnError("Forecast lookup failed", error);

    const page = (data ?? []) as ForecastRow[];
    rows.push(...page);

    if (page.length < pageSize) return rows;
  }
}

async function main() {
  const client = createSupabaseAdminClient();
  const slugs = beaches.map((beach) => beach.slug);

  const [beachesResult, sourcesResult, parkingResult, mediaResult, webcamResult, reviewResult] = await Promise.all([
    client
      .from("beaches")
      .select("id, slug, name, description, latitude, longitude, image_path, image_alt, image_credit, image_license, is_published, publication_status")
      .in("slug", slugs),
    client.from("beach_sources").select("beach_id, is_primary"),
    client.from("parking_facilities").select("beach_id, content_status"),
    client.from("media_items").select("beach_id, publication_status"),
    client.from("webcams").select("beach_id, content_status"),
    client.from("review_profiles").select("beach_id, verification_status"),
  ]);

  throwOnError("Beach lookup failed", beachesResult.error);
  throwOnError("Source lookup failed", sourcesResult.error);
  throwOnError("Parking lookup failed", parkingResult.error);
  throwOnError("Media lookup failed", mediaResult.error);
  throwOnError("Webcam lookup failed", webcamResult.error);
  throwOnError("Review profile lookup failed", reviewResult.error);

  const liveBeaches = (beachesResult.data ?? []) as LiveBeachRow[];
  const sourceRows = (sourcesResult.data ?? []) as SourceRow[];
  const forecastRows = (
    await Promise.all(liveBeaches.map((beach) => readForecastRowsForBeach(client, beach.id)))
  ).flat();
  const parkingRows = (parkingResult.data ?? []) as StatusRow[];
  const mediaRows = (mediaResult.data ?? []) as MediaStatusRow[];
  const webcamRows = (webcamResult.data ?? []) as StatusRow[];
  const reviewRows = (reviewResult.data ?? []) as ReviewStatusRow[];
  const primaryBeachIds = new Set(sourceRows.filter((row) => row.is_primary).map((row) => row.beach_id));
  const forecastCounts = countByBeach(forecastRows);
  const parkingCounts = countVerifiedByBeach(parkingRows, "content_status");
  const mediaCounts = countVerifiedByBeach(mediaRows, "publication_status");
  const webcamCounts = countVerifiedByBeach(webcamRows, "content_status");
  const reviewCounts = countVerifiedByBeach(reviewRows, "verification_status");

  const results = liveBeaches
    .sort((left, right) => left.slug.localeCompare(right.slug))
    .map((beach) => {
      const input: BeachPublicationReadinessInput = {
        slug: beach.slug,
        description: beach.description,
        latitude: beach.latitude,
        longitude: beach.longitude,
        imagePath: beach.image_path,
        imageAlt: beach.image_alt,
        imageCredit: beach.image_credit,
        imageLicense: beach.image_license,
        hasPrimarySource: primaryBeachIds.has(beach.id),
        forecastRowCount: forecastCounts.get(beach.id) ?? 0,
        verifiedParkingCount: parkingCounts.get(beach.id) ?? 0,
        verifiedMediaCount: mediaCounts.get(beach.id) ?? 0,
        verifiedWebcamCount: webcamCounts.get(beach.id) ?? 0,
        verifiedReviewProfileCount: reviewCounts.get(beach.id) ?? 0,
      };
      const readiness = evaluateBeachPublicationReadiness(input);

      return {
        ...readiness,
        name: beach.name,
        is_published: beach.is_published,
        publication_status: beach.publication_status,
        forecast_rows: input.forecastRowCount,
        verified_parking: input.verifiedParkingCount,
        verified_media: input.verifiedMediaCount,
        verified_webcams: input.verifiedWebcamCount,
        verified_review_profiles: input.verifiedReviewProfileCount,
      };
    });

  const optionalGaps = results.reduce<Record<string, number>>((counts, result) => {
    for (const gap of result.gaps) counts[gap] = (counts[gap] ?? 0) + 1;
    return counts;
  }, {});

  console.log(
    JSON.stringify(
      {
        mode: "read-only",
        project: "marenostrum",
        total: results.length,
        ready: results.filter((result) => result.ready).length,
        blocked: results.filter((result) => !result.ready).length,
        optional_gaps: optionalGaps,
        beaches: results,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Publication readiness check failed";
  console.error(message);
  process.exitCode = 1;
});
