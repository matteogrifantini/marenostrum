import { describe, expect, it, vi } from "vitest";
import {
  handleFavorites,
  isMissingAuthSessionError,
  type FavoritesApiDependencies,
} from "./route";

const url = "http://localhost/api/favorites";

function dependencies(
  overrides: Partial<FavoritesApiDependencies> = {},
): FavoritesApiDependencies {
  return {
    getUser: vi.fn(async () => ({ id: "user-1", email: "matteo@example.com" })),
    list: vi.fn(async () => ["cala-rossa"]),
    add: vi.fn(async (_userId, slug) => slug),
    remove: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("/api/favorites", () => {
  it("recognizes a missing Auth session as an anonymous request", () => {
    expect(isMissingAuthSessionError({ name: "AuthSessionMissingError" })).toBe(true);
    expect(isMissingAuthSessionError(new Error("database unavailable"))).toBe(false);
  });

  it("requires an authenticated user", async () => {
    const deps = dependencies({ getUser: vi.fn(async () => null) });

    const response = await handleFavorites(new Request(url), deps);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Accedi per sincronizzare i preferiti",
    });
  });

  it("lists the signed-in user's favorites", async () => {
    const deps = dependencies();

    const response = await handleFavorites(new Request(url), deps);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, favorites: ["cala-rossa"] });
    expect(deps.list).toHaveBeenCalledWith("user-1");
  });

  it("validates and adds a favorite", async () => {
    const deps = dependencies();

    const response = await handleFavorites(
      new Request(url, {
        method: "POST",
        body: JSON.stringify({ slug: "cala-azzurra-favignana" }),
      }),
      deps,
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, favorite: "cala-azzurra-favignana" });
    expect(deps.add).toHaveBeenCalledWith("user-1", "cala-azzurra-favignana");
  });

  it("rejects malformed favorite slugs before persistence", async () => {
    const deps = dependencies();

    const response = await handleFavorites(
      new Request(url, {
        method: "POST",
        body: JSON.stringify({ slug: "Cala Rossa" }),
      }),
      deps,
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "Spiaggia non valida" });
    expect(deps.add).not.toHaveBeenCalled();
  });

  it("removes a favorite", async () => {
    const deps = dependencies();

    const response = await handleFavorites(
      new Request(url, {
        method: "DELETE",
        body: JSON.stringify({ slug: "cala-rossa" }),
      }),
      deps,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, favorite: "cala-rossa" });
    expect(deps.remove).toHaveBeenCalledWith("user-1", "cala-rossa");
  });
});
