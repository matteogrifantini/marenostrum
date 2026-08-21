import type { BeachDetailReport } from "../../../../data/demo-beach-details";
import {
  createCommunityReport,
  type CommunityReportInput,
} from "../../../../services/community-reports";
import {
  isCommunityReportDetail,
  isCommunityReportCategory,
  type CommunityReportCategory,
} from "../../../../domain/community-reports";

export type CommunityReportDependencies = {
  create: (input: CommunityReportInput) => Promise<BeachDetailReport>;
};

function errorResponse(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

function parseInput(value: unknown): CommunityReportInput | null {
  if (!value || typeof value !== "object") return null;

  const body = value as Record<string, unknown>;
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const detail = typeof body.detail === "string" ? body.detail.trim() : "";
  const category = body.category as CommunityReportCategory;

  if (!slug || !isCommunityReportCategory(category) || !detail || detail.length > 280 || !isCommunityReportDetail(category, detail)) {
    return null;
  }

  return { slug, category, detail };
}

export async function handleCommunityReport(
  request: Request,
  dependencies: CommunityReportDependencies = { create: createCommunityReport },
) {
  let input: CommunityReportInput | null = null;

  try {
    input = parseInput(await request.json());
  } catch {
    return errorResponse(400, "Dati non validi");
  }

  if (!input) return errorResponse(400, "Dati non validi");

  try {
    const report = await dependencies.create(input);
    return Response.json({ ok: true, report }, { status: 201 });
  } catch {
    return errorResponse(503, "Segnalazione non disponibile");
  }
}

export async function POST(request: Request) {
  return handleCommunityReport(request);
}
