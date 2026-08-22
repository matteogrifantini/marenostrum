import type { BeachDetailReport } from "../domain/beach-detail-content";
import {
  getCommunityReportCategory,
  type CommunityReportCategory,
} from "../domain/community-reports";

type CommunityReportRow = {
  id: string;
  category: CommunityReportCategory;
  detail: string;
  created_at: string;
  reporter_id: string | null;
};

export const COMMUNITY_REPORT_RETENTION_HOURS = 24;
export const COMMUNITY_REPORT_MAX_PER_REPORTER = 12;

export type CommunityReportInput = {
  slug: string;
  category: CommunityReportCategory;
  detail: string;
  reporterId?: string;
};

export class CommunityReportNotFoundError extends Error {
  constructor() {
    super("Published beach not found");
    this.name = "CommunityReportNotFoundError";
  }
}

export class CommunityReportDuplicateError extends Error {
  constructor() {
    super("This report was already submitted by this reporter");
    this.name = "CommunityReportDuplicateError";
  }
}

export class CommunityReportRateLimitError extends Error {
  constructor() {
    super("Community report rate limit reached");
    this.name = "CommunityReportRateLimitError";
  }
}

export function communityReportCutoff(now = new Date()) {
  return new Date(
    now.getTime() - COMMUNITY_REPORT_RETENTION_HOURS * 60 * 60 * 1000,
  ).toISOString();
}

export function isCommunityReportRateLimited(recentReportCount: number | null | undefined) {
  return (recentReportCount ?? 0) >= COMMUNITY_REPORT_MAX_PER_REPORTER;
}

export function normalizeCommunityReportDetail(detail: string) {
  const normalized = detail.trim();
  return normalized || "Segnalazione dalla community";
}

function formatReportAge(createdAt: string, now = new Date()) {
  const created = new Date(createdAt).getTime();
  const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - created) / 60_000));

  if (elapsedMinutes < 1) return "adesso";
  if (elapsedMinutes < 60) return `${elapsedMinutes} min fa`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} or${elapsedHours === 1 ? "a" : "e"} fa`;

  return "ieri";
}

function mapCommunityReportRow(
  row: CommunityReportRow,
  now = new Date(),
  confirmations = 1,
): BeachDetailReport {
  const category = getCommunityReportCategory(row.category);

  return {
    id: row.id,
    emoji: category.emoji,
    title: category.title,
    detail: row.detail,
    age: formatReportAge(row.created_at, now),
    confirmations,
  };
}

export function mapCommunityReportRows(rows: CommunityReportRow[], now = new Date()) {
  const groups = new Map<
    string,
    { latest: CommunityReportRow; reporters: Set<string>; legacyRows: number }
  >();

  for (const row of rows) {
    const key = `${row.category}\u0000${row.detail}`;
    const group = groups.get(key) ?? {
      latest: row,
      reporters: new Set<string>(),
      legacyRows: 0,
    };

    if (new Date(row.created_at).getTime() > new Date(group.latest.created_at).getTime()) {
      group.latest = row;
    }

    if (row.reporter_id) {
      group.reporters.add(row.reporter_id);
    } else {
      group.legacyRows += 1;
    }

    groups.set(key, group);
  }

  return [...groups.values()]
    .sort(
      (left, right) =>
        new Date(right.latest.created_at).getTime() - new Date(left.latest.created_at).getTime(),
    )
    .map((group) =>
      mapCommunityReportRow(
        group.latest,
        now,
        group.reporters.size + group.legacyRows,
      ),
    );
}

async function createAdminClient() {
  const { createSupabaseAdminClient } = await import("../lib/supabase/admin");
  return createSupabaseAdminClient();
}

async function findPublishedBeachId(slug: string) {
  const client = await createAdminClient();
  const { data, error } = await client
    .from("beaches")
    .select("id")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new CommunityReportNotFoundError();

  return { client, beachId: data.id };
}

export async function createCommunityReport(input: CommunityReportInput) {
  const { client, beachId } = await findPublishedBeachId(input.slug);
  const detail = normalizeCommunityReportDetail(input.detail);

  if (input.reporterId) {
    const { count, error } = await client
      .from("community_reports")
      .select("id", { count: "exact", head: true })
      .eq("reporter_id", input.reporterId)
      .gte("created_at", communityReportCutoff());

    if (error) throw error;
    if (isCommunityReportRateLimited(count)) throw new CommunityReportRateLimitError();
  }

  const { data, error } = await client
    .from("community_reports")
    .insert({
      beach_id: beachId,
      category: input.category,
      detail,
      ...(input.reporterId ? { reporter_id: input.reporterId } : {}),
    })
    .select("id, category, detail, created_at, reporter_id")
    .single();

  if (error) {
    if (error.code === "23505") throw new CommunityReportDuplicateError();
    throw error;
  }

  return mapCommunityReportRow(data as CommunityReportRow);
}

export async function getCommunityReportsForBeach(slug: string) {
  try {
    const { client, beachId } = await findPublishedBeachId(slug);
    const { data, error } = await client
      .from("community_reports")
      .select("id, category, detail, created_at, reporter_id")
      .eq("beach_id", beachId)
      .gte("created_at", communityReportCutoff())
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return [];

    return mapCommunityReportRows(data as CommunityReportRow[]);
  } catch {
    return [];
  }
}
