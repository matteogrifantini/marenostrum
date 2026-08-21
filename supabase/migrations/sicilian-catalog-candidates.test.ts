import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260821142511_sicilian_catalog_candidates.sql"),
  "utf8",
);

describe("Sicilian catalog candidates migration contract", () => {
  it("stores sourced candidates separately from published beaches", () => {
    expect(migration).toMatch(/create table public\.beach_catalog_candidates/);
    expect(migration).toMatch(/slug text not null unique/);
    expect(migration).toMatch(/region text not null check \(region = 'Sicilia'\)/);
    expect(migration).toMatch(/province text not null check \(province in \('AG', 'CL', 'CT', 'EN', 'ME', 'PA', 'RG', 'SR', 'TP'\)\)/);
    expect(migration).toMatch(/publication_status text not null default 'draft'/);
    expect(migration).toMatch(/source_url text not null/);
    expect(migration).toMatch(/latitude numeric\(9, 6\)/);
    expect(migration).toMatch(/longitude numeric\(9, 6\)/);
    expect(migration).toMatch(/latitude is null and longitude is null[\s\S]+latitude is not null and longitude is not null/);
    expect(migration).toMatch(/alter table public\.beach_catalog_candidates enable row level security/);
    expect(migration).toMatch(/revoke all on table public\.beach_catalog_candidates from anon, authenticated/);
    expect(migration).toMatch(/grant all on table public\.beach_catalog_candidates to service_role/);
  });
});
