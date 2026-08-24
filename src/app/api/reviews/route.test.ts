import { describe, expect, it, vi } from "vitest";
import {
  handleBeachReviews,
  type BeachReviewsApiDependencies,
} from "./route";

const url = "http://localhost/api/reviews";

function dependencies(
  overrides: Partial<BeachReviewsApiDependencies> = {},
): BeachReviewsApiDependencies {
  return {
    getUser: vi.fn(async () => ({
      id: "user-1",
      email: "matteo@example.com",
      displayName: "Matteo",
    })),
    findPublishedBeach: vi.fn(async () => ({ id: "beach-1" })),
    upsert: vi.fn(async (_userId, _beachId, input) => ({
      id: "review-1",
      beach_id: "beach-1",
      user_id: "user-1",
      author_name: "Matteo",
      rating: input.rating,
      body: input.body,
      created_at: "2026-08-24T08:00:00.000Z",
      updated_at: "2026-08-24T08:00:00.000Z",
    })),
    remove: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("/api/reviews", () => {
  it("requires authentication before accepting a review", async () => {
    const response = await handleBeachReviews(
      new Request(url, { method: "POST", body: JSON.stringify({ slug: "cala-rossa", rating: 5 }) }),
      dependencies({ getUser: vi.fn(async () => null) }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "Accedi per lasciare una recensione" });
  });

  it("validates the rating and persists only the normalized review body", async () => {
    const deps = dependencies();
    const response = await handleBeachReviews(
      new Request(url, {
        method: "POST",
        body: JSON.stringify({
          slug: "cala-rossa",
          rating: 5,
          body: "  Acqua splendida.  ",
          author: "Nome falsificato",
        }),
      }),
      deps,
    );

    expect(response.status).toBe(200);
    expect(deps.upsert).toHaveBeenCalledWith(
      "user-1",
      "beach-1",
      { rating: 5, body: "Acqua splendida." },
      "Matteo",
    );
    expect(await response.json()).toMatchObject({
      ok: true,
      review: { id: "review-1", author: "Matteo", rating: 5, text: "Acqua splendida." },
    });
  });

  it("rejects invalid ratings and unknown beaches before persistence", async () => {
    const deps = dependencies({ findPublishedBeach: vi.fn(async () => null) });
    const response = await handleBeachReviews(
      new Request(url, {
        method: "POST",
        body: JSON.stringify({ slug: "cala-rossa", rating: 6, body: "No" }),
      }),
      deps,
    );

    expect(response.status).toBe(400);
    expect(deps.findPublishedBeach).not.toHaveBeenCalled();
    expect(deps.upsert).not.toHaveBeenCalled();
  });

  it("deletes only through the authenticated owner dependency", async () => {
    const deps = dependencies();
    const response = await handleBeachReviews(
      new Request(url, { method: "DELETE", body: JSON.stringify({ id: "review-1" }) }),
      deps,
    );

    expect(response.status).toBe(200);
    expect(deps.remove).toHaveBeenCalledWith("user-1", "review-1");
  });

  it("rejects unsupported methods", async () => {
    const response = await handleBeachReviews(new Request(url, { method: "GET" }), dependencies());

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST, DELETE");
  });
});
