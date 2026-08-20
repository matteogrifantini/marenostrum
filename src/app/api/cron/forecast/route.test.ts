import { describe, expect, it, vi } from "vitest";

import { handleForecastCron, type ForecastCronDependencies } from "./route";

const url = "http://localhost/api/cron/forecast";

function dependencies(
  overrides: Partial<ForecastCronDependencies> = {},
): ForecastCronDependencies & { synchronize: ReturnType<typeof vi.fn> } {
  return {
    cronSecret: "correct-secret",
    synchronize: vi.fn(async () => ({
      beaches: 3,
      points: 288,
      observedAt: "2026-08-20T06:00:00.000Z",
    })),
    ...overrides,
  } as ForecastCronDependencies & { synchronize: ReturnType<typeof vi.fn> };
}

describe("handleForecastCron", () => {
  it("rejects requests without the exact bearer credential", async () => {
    const deps = dependencies();

    const response = await handleForecastCron(new Request(url), deps);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false });
    expect(deps.synchronize).not.toHaveBeenCalled();
  });

  it.each([
    "Basic correct-secret",
    "Bearer wrong-secret",
    "Bearer  correct-secret",
    "Bearer\tcorrect-secret",
    "bearer correct-secret",
  ])("rejects malformed or incorrect bearer credentials: %s", async (authorization) => {
    const deps = dependencies();

    const response = await handleForecastCron(
      new Request(url, { headers: { authorization } }),
      deps,
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false });
    expect(deps.synchronize).not.toHaveBeenCalled();
  });

  it("returns only the synchronization result to an authorized request", async () => {
    const deps = dependencies();

    const response = await handleForecastCron(
      new Request(url, { headers: { authorization: "Bearer correct-secret" } }),
      deps,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      beaches: 3,
      points: 288,
      observedAt: "2026-08-20T06:00:00.000Z",
    });
  });

  it("fails safely when the cron secret is missing", async () => {
    const deps = dependencies({ cronSecret: undefined });

    const response = await handleForecastCron(new Request(url), deps);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false });
    expect(deps.synchronize).not.toHaveBeenCalled();
  });

  it("hides provider failures from authorized callers", async () => {
    const deps = dependencies({
      synchronize: vi.fn(async () => Promise.reject(new Error("provider failed: correct-secret"))),
    });

    const response = await handleForecastCron(
      new Request(url, { headers: { authorization: "Bearer correct-secret" } }),
      deps,
    );

    expect(response.status).toBe(502);
    const body = await response.text();
    expect(JSON.parse(body)).toEqual({ ok: false });
    expect(body).not.toContain("correct-secret");
  });
});
