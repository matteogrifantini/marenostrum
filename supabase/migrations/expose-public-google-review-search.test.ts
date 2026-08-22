import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260822094310_expose_public_google_review_search.sql"),
  "utf8",
);

describe("public Google review search policy", () => {
  it("exposes only review links attached to published beaches", () => {
    expect(migration).toMatch(/drop policy if exists "Published review profiles are readable"/);
    expect(migration).toMatch(/verification_status in \('draft', 'verified', 'stale'\)/);
    expect(migration).toMatch(/beaches\.is_published = true/);
  });
});
