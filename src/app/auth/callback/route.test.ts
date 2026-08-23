import { describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("../../../lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: authMocks })),
}));

import { GET } from "./route";

describe("auth callback", () => {
  it("exchanges the code and redirects to an internal destination", async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({ error: null });

    const response = await GET(
      new Request("https://marenostrum.app/auth/callback?code=valid&next=%2Fpreferiti"),
    );

    expect(authMocks.exchangeCodeForSession).toHaveBeenCalledWith("valid");
    expect(response.headers.get("location")).toBe("https://marenostrum.app/preferiti");
  });

  it("does not redirect to an external next URL", async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({ error: null });

    const response = await GET(
      new Request("https://marenostrum.app/auth/callback?code=valid&next=https%3A%2F%2Fevil.example"),
    );

    expect(response.headers.get("location")).toBe("https://marenostrum.app/impostazioni");
  });

  it("redirects to a safe error state when the exchange fails", async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({ error: new Error("provider failure") });

    const response = await GET(
      new Request("https://marenostrum.app/auth/callback?code=invalid"),
    );

    expect(response.headers.get("location")).toBe(
      "https://marenostrum.app/impostazioni?auth=error",
    );
  });
});
