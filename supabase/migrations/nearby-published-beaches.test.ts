import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260903065424_nearby_published_beaches.sql"),
  "utf8",
);

describe("nearby published beaches migration", () => {
  it("uses an invoker PostGIS radius function with the publication gate", () => {
    expect(migration).toMatch(/create or replace function public\.nearby_published_beaches/);
    expect(migration).toMatch(/security invoker/);
    expect(migration).toMatch(/extensions\.st_dwithin/);
    expect(migration).toMatch(/query_radius_km between 1 and 100/);
    expect(migration).toMatch(/beaches\.publication_status in \('verified', 'stale'\)/);
    expect(migration).not.toMatch(/security definer/);
  });
});
