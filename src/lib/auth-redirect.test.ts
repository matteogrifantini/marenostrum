import { describe, expect, it } from "vitest";
import {
  buildAuthRedirectUrl,
  getRequestAuthOrigin,
  safeAuthNext,
} from "./auth-redirect";

describe("auth redirect helpers", () => {
  it("builds an internal callback URL on the current origin", () => {
    expect(buildAuthRedirectUrl("https://marenostrum.app", "/preferiti")).toBe(
      "https://marenostrum.app/auth/callback?next=%2Fpreferiti",
    );
  });

  it("ignores a localhost configured site URL in production", () => {
    expect(
      buildAuthRedirectUrl("https://marenostrum.app", "/impostazioni", {
        configuredSiteUrl: "http://localhost:3000",
        production: true,
      }),
    ).toBe("https://marenostrum.app/auth/callback?next=%2Fimpostazioni");
  });

  it("keeps only internal next paths", () => {
    expect(safeAuthNext("/preferiti?from=auth")).toBe("/preferiti?from=auth");
    expect(safeAuthNext("https://evil.example/login")).toBe("/impostazioni");
    expect(safeAuthNext("//evil.example/login")).toBe("/impostazioni");
  });

  it("uses the forwarded public origin for a production callback", () => {
    const request = new Request("http://127.0.0.1:3000/auth/callback", {
      headers: {
        "x-forwarded-host": "marenostrum.app",
        "x-forwarded-proto": "https",
      },
    });

    expect(getRequestAuthOrigin(request, { production: true })).toBe(
      "https://marenostrum.app",
    );
  });

  it("does not trust an unrelated forwarded host in production", () => {
    const request = new Request("http://127.0.0.1:3000/auth/callback", {
      headers: {
        "x-forwarded-host": "evil.example",
        "x-forwarded-proto": "https",
      },
    });

    expect(getRequestAuthOrigin(request, { production: true })).toBe(
      "https://marenostrum.app",
    );
  });
});
