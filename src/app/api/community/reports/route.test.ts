import { describe, expect, it, vi } from "vitest";
import type { BeachDetailReport } from "../../../../data/demo-beach-details";
import {
  handleCommunityReport,
  type CommunityReportDependencies,
} from "./route";

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
      detail: "Acqua limpida vicino alla riva",
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
    expect(deps.create).toHaveBeenCalledWith(payload);
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
        body: JSON.stringify({ slug: "cala-del-gelsomino", category: "water", detail: "" }),
      }),
      deps,
    );

    expect(response.status).toBe(503);
    const body = await response.text();
    expect(JSON.parse(body)).toEqual({ ok: false, error: "Segnalazione non disponibile" });
    expect(body).not.toContain("service key leaked");
  });
});
