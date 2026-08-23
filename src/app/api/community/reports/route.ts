import type { BeachDetailReport } from "../../../../domain/beach-detail-content";
import { createClient } from "../../../../lib/supabase/server";
import {
  createCommunityReport,
  CommunityReportDuplicateError,
  CommunityReportRateLimitError,
  type CommunityReportInput,
} from "../../../../services/community-reports";
import {
  isCommunityReportDetail,
  isCommunityReportCategory,
  type CommunityReportCategory,
} from "../../../../domain/community-reports";

export type CommunityReportDependencies = {
  create: (input: CommunityReportInput) => Promise<BeachDetailReport>;
  getAuthenticatedReporterId?: () => Promise<string | null>;
};

const REPORTER_COOKIE = "marenostrum_community_reporter_v1";
const REPORTER_ID_PATTERN = /^[0-9a-f-]{36}$/;

function errorResponse(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie?.slice(name.length + 1) ?? null;
}

function anonymousReporterIdentity(request: Request) {
  const existing = readCookie(request, REPORTER_COOKIE);
  if (existing && REPORTER_ID_PATTERN.test(existing)) {
    return { id: existing, shouldSetCookie: false };
  }

  return { id: crypto.randomUUID(), shouldSetCookie: true };
}

async function authenticatedReporterIdentity() {
  try {
    const client = await createClient();
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data.user?.id && REPORTER_ID_PATTERN.test(data.user.id) ? data.user.id : null;
  } catch {
    return null;
  }
}

function withReporterCookie(
  response: Response,
  request: Request,
  reporterId: string,
  shouldSetCookie: boolean,
) {
  if (!shouldSetCookie) return response;

  const secure = request.url.startsWith("https:") ? "; Secure" : "";
  response.headers.append(
    "set-cookie",
    `${REPORTER_COOKIE}=${reporterId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`,
  );
  return response;
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

  const authenticatedReporterId = dependencies.getAuthenticatedReporterId
    ? await dependencies.getAuthenticatedReporterId()
    : await authenticatedReporterIdentity();
  const reporter = authenticatedReporterId
    ? { id: authenticatedReporterId, shouldSetCookie: false }
    : anonymousReporterIdentity(request);

  try {
    const report = await dependencies.create({ ...input, reporterId: reporter.id });
    return withReporterCookie(
      Response.json({ ok: true, report }, { status: 201 }),
      request,
      reporter.id,
      reporter.shouldSetCookie,
    );
  } catch (error) {
    const response = error instanceof CommunityReportRateLimitError
      ? errorResponse(429, "Hai raggiunto il limite giornaliero di segnalazioni")
      : error instanceof CommunityReportDuplicateError
        ? errorResponse(409, "Hai già inviato questa segnalazione")
        : errorResponse(503, "Segnalazione non disponibile");

    if (response.status === 429) response.headers.set("retry-after", "86400");

    return withReporterCookie(response, request, reporter.id, reporter.shouldSetCookie);
  }
}

export async function POST(request: Request) {
  return handleCommunityReport(request);
}
