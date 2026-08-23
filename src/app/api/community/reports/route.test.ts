import { describe, expect, it, vi } from "vitest";
import type { BeachDetailReport } from "../../../../data/demo-beach-details";
import {
  handleCommunityReport,
  type CommunityReportDependencies,
} from "./route";
import { CommunityReportRateLimitError } from "../../../../services/community-reports";

const url = "http://localhost/api/community/reports";

function dependencies(
  overrides: Partial<CommunityReportDependencies> = {},
): CommunityReportDependencies & { create: ReturnType<typeof vi.fn> } {
  const create = vi.fn(async (input: { detail: string }) => ({
      id: "community-1",
      emoji: "🌊",
      title: "Acqua",
      detail: input.detail,
      age: "adesso",
      confirmations: 1,
    } satisfies BeachDetailReport));

  return {
    create,
    ...overrides,
  } as CommunityReportDependencies & { create: ReturnType<typeof vi.fn> };
}

describe("handleCommunityReport", () => {
  it("validates the public report payload before calling Supabase", async () => {
    const deps = dependencies();

    const response = await handleCommunityReport(
      new Request(url, {
        method: "POST",
        body: JSON.stringify({ slug: "cala-del-gelsomino", category: "unknown", detail: "" }),
      }),
      deps,
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "Dati non validi" });
    expect(deps.create).not.toHaveBeenCalled();
  });

  it("creates a report and returns the mapped community item", async () => {
    const deps = dependencies();
    const payload = {
      slug: "cala-del-gelsomino",
      category: "water",
      detail: "Acqua limpida",
    };

    const response = await handleCommunityReport(
      new Request(url, { method: "POST", body: JSON.stringify(payload) }),
      deps,
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      ok: true,
      report: expect.objectContaining({ title: "Acqua", detail: payload.detail }),
    });
    expect(deps.create).toHaveBeenCalledWith(
      expect.objectContaining({ ...payload, reporterId: expect.stringMatching(/^[0-9a-f-]{36}$/) }),
    );
    expect(response.headers.get("set-cookie")).toContain("marenostrum_community_reporter_v1=");
  });

  it("reuses the anonymous reporter identity from the request cookie", async () => {
    const deps = dependencies();
    const reporterId = "11111111-1111-4111-8111-111111111111";

    await handleCommunityReport(
      new Request(url, {
        method: "POST",
        headers: { cookie: `marenostrum_community_reporter_v1=${reporterId}` },
        body: JSON.stringify({ slug: "cala-del-gelsomino", category: "water", detail: "Mare mosso" }),
      }),
      deps,
    );

    expect(deps.create).toHaveBeenCalledWith(expect.objectContaining({ reporterId }));
  });

  it("uses the authenticated user's id when a session is available", async () => {
    const deps = dependencies({
      getAuthenticatedReporterId: vi.fn(async () => "33333333-3333-4333-8333-333333333333"),
    });

    const response = await handleCommunityReport(
      new Request(url, {
        method: "POST",
        body: JSON.stringify({ slug: "cala-del-gelsomino", category: "water", detail: "Mare calmo" }),
      }),
      deps,
    );

    expect(response.status).toBe(201);
    expect(deps.create).toHaveBeenCalledWith(expect.objectContaining({
      reporterId: "33333333-3333-4333-8333-333333333333",
    }));
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("rejects details that do not belong to the selected category", async () => {
    const deps = dependencies();

    const response = await handleCommunityReport(
      new Request(url, {
        method: "POST",
        body: JSON.stringify({
          slug: "cala-del-gelsomino",
          category: "water",
          detail: "Parcheggio pieno",
        }),
      }),
      deps,
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "Dati non validi" });
    expect(deps.create).not.toHaveBeenCalled();
  });

  it("hides persistence failures from the browser", async () => {
    const deps = dependencies({
      create: vi.fn(async () => {
        throw new Error("service key leaked");
      }),
    });

    const response = await handleCommunityReport(
      new Request(url, {
        method: "POST",
        body: JSON.stringify({ slug: "cala-del-gelsomino", category: "water", detail: "Acqua limpida" }),
      }),
      deps,
    );

    expect(response.status).toBe(503);
    const body = await response.text();
    expect(JSON.parse(body)).toEqual({ ok: false, error: "Segnalazione non disponibile" });
    expect(body).not.toContain("service key leaked");
  });

  it("returns a retryable response when an anonymous reporter reaches the daily limit", async () => {
    const deps = dependencies({
      create: vi.fn(async () => {
        throw new CommunityReportRateLimitError();
      }),
    });

    const response = await handleCommunityReport(
      new Request(url, {
        method: "POST",
        body: JSON.stringify({ slug: "cala-del-gelsomino", category: "water", detail: "Mare mosso" }),
      }),
      deps,
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("86400");
    expect(await response.json()).toEqual({
      ok: false,
      error: "Hai raggiunto il limite giornaliero di segnalazioni",
    });
    expect(response.headers.get("set-cookie")).toContain("marenostrum_community_reporter_v1=");
  });
});
