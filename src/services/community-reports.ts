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
};

export type CommunityReportInput = {
  slug: string;
  category: CommunityReportCategory;
  detail: string;
};

export class CommunityReportNotFoundError extends Error {
  constructor() {
    super("Published beach not found");
    this.name = "CommunityReportNotFoundError";
  }
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

export function mapCommunityReportRow(
  row: CommunityReportRow,
  now = new Date(),
): BeachDetailReport {
  const category = getCommunityReportCategory(row.category);

  return {
    id: row.id,
    emoji: category.emoji,
    title: category.title,
    detail: row.detail,
    age: formatReportAge(row.created_at, now),
  };
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
  const { data, error } = await client
    .from("community_reports")
    .insert({
      beach_id: beachId,
      category: input.category,
      detail: normalizeCommunityReportDetail(input.detail),
    })
    .select("id, category, detail, created_at")
    .single();

  if (error) throw error;

  return mapCommunityReportRow(data as CommunityReportRow);
}

export async function getCommunityReportsForBeach(slug: string) {
  try {
    const { client, beachId } = await findPublishedBeachId(slug);
    const { data, error } = await client
      .from("community_reports")
      .select("id, category, detail, created_at")
      .eq("beach_id", beachId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return [];

    return (data as CommunityReportRow[]).map((row) => mapCommunityReportRow(row));
  } catch {
    return [];
  }
}
