import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260902090000_public_publication_status_gate.sql"),
  "utf8",
);

describe("public publication status gate migration", () => {
  it("requires verified or stale beaches for public beach and forecast reads", () => {
    expect(migration).toMatch(/drop policy if exists "Published beaches are readable" on public\.beaches;/);
    expect(migration).toMatch(
      /drop policy if exists "Conditions for published beaches are readable" on public\.beach_conditions;/,
    );
    expect(migration).toMatch(/is_published = true/);
    expect(migration).toMatch(/publication_status in \('verified', 'stale'\)/);
  });
});
