import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260821150047_catalog_candidates_policy.sql"),
  "utf8",
);

describe("catalog candidates policy migration contract", () => {
  it("keeps the candidate intake table explicitly private", () => {
    expect(migration).toMatch(/create policy "Catalog candidates are server-only"/);
    expect(migration).toMatch(/on public\.beach_catalog_candidates[\s\S]+for all[\s\S]+using \(false\)[\s\S]+with check \(false\)/);
  });
});
