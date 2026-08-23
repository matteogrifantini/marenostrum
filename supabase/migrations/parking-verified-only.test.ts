import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260823122500_parking_verified_only.sql"),
  "utf8",
);

describe("parking publication policy migration", () => {
  it("exposes only verified parking for published beaches", () => {
    expect(migration).toMatch(/content_status = 'verified'/);
    expect(migration).not.toMatch(/in\s*\(\s*'verified'\s*,\s*'stale'\s*\)/);
    expect(migration).toMatch(/beaches\.is_published = true/);
  });
});
