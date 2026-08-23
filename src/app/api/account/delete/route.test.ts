import { describe, expect, it, vi } from "vitest";

import {
  handleAccountDeletion,
  type AccountDeletionDependencies,
} from "./route";

const url = "https://marenostrum.app/api/account/delete";

function dependencies(
  overrides: Partial<AccountDeletionDependencies> = {},
): AccountDeletionDependencies {
  return {
    getUser: vi.fn(async () => ({ id: "user-1" })),
    signOut: vi.fn(async () => undefined),
    deleteUser: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("POST /api/account/delete", () => {
  it("requires an authenticated user", async () => {
    const deps = dependencies({ getUser: vi.fn(async () => null) });
    const response = await handleAccountDeletion(new Request(url, { method: "POST" }), deps);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Accedi per eliminare il tuo account",
    });
  });

  it("revokes the session before deleting only the current user", async () => {
    const deps = dependencies();
    const response = await handleAccountDeletion(new Request(url, { method: "POST" }), deps);

    expect(response.status).toBe(200);
    expect(deps.signOut).toHaveBeenCalledBefore(deps.deleteUser as ReturnType<typeof vi.fn>);
    expect(deps.deleteUser).toHaveBeenCalledWith("user-1");
  });

  it("does not delete when session revocation fails", async () => {
    const deps = dependencies({
      signOut: vi.fn(async () => {
        throw new Error("session failure");
      }),
    });
    const response = await handleAccountDeletion(new Request(url, { method: "POST" }), deps);

    expect(response.status).toBe(503);
    expect(deps.deleteUser).not.toHaveBeenCalled();
  });

  it("allows only POST", async () => {
    const response = await handleAccountDeletion(new Request(url, { method: "DELETE" }), dependencies());

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
  });
});
