import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
}));

vi.mock("../lib/supabase/client", () => ({
  createClient: () => ({ auth: authMocks }),
}));

import { AccountHeaderLabel, getUserDisplayName } from "./account-header-label";

describe("account header label", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.getUser.mockResolvedValue({ data: { user: null } });
  });

  it("prefers the Google full name and falls back to email", () => {
    expect(getUserDisplayName({
      email: "matteo@example.com",
      user_metadata: { full_name: "Matteo Mare" },
    })).toBe("Matteo Mare");
    expect(getUserDisplayName({ email: "matteo@example.com", user_metadata: {} })).toBe("matteo@example.com");
  });

  it("shows the signed-in user's name in the header", async () => {
    authMocks.getUser.mockResolvedValue({
      data: {
        user: {
          email: "matteo@example.com",
          user_metadata: { full_name: "Matteo Mare" },
        },
      },
    });

    render(<AccountHeaderLabel />);

    await waitFor(() => expect(screen.getByText("Matteo Mare")).toBeInTheDocument());
  });

  it("keeps Accedi when no user is available", async () => {
    render(<AccountHeaderLabel />);

    await waitFor(() => expect(screen.getByText("Accedi")).toBeInTheDocument());
  });
});
