import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260821113529_add_community_reports.sql"),
  "utf8",
);
const identityMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260822121051_community_report_reporter_identity.sql"),
  "utf8",
);

describe("community reports migration contract", () => {
  it("creates an append-only report table with public read and insert RLS", () => {
    expect(migration).toMatch(/create table public\.community_reports/);
    expect(migration).toMatch(/beach_id uuid not null references public\.beaches\(id\) on delete cascade/);
    expect(migration).toMatch(/category text not null check \(category in \('parking', 'crowding', 'water', 'wind', 'services'\)\)/);
    expect(migration).toMatch(/detail text not null check \(char_length\(detail\) <= 280\)/);
    expect(migration).toMatch(/alter table public\.community_reports enable row level security/);
    expect(migration).toMatch(/grant select, insert on table public\.community_reports to anon, authenticated/);
    expect(migration).toMatch(/grant select, insert on table public\.community_reports to service_role/);
    expect(migration).toMatch(/revoke update, delete on table public\.community_reports from anon, authenticated/);
    expect(migration).toMatch(/for select[\s\S]+using \([\s\S]+is_published = true/);
    expect(migration).toMatch(/for insert[\s\S]+with check \([\s\S]+is_published = true/);
  });

  it("adds anonymous reporter deduplication without deleting existing reports", () => {
    expect(identityMigration).toMatch(/alter table public\.community_reports\s+add column reporter_id text/);
    expect(identityMigration).toMatch(/reporter_id is null or reporter_id ~/);
    expect(identityMigration).toMatch(/create unique index community_reports_reporter_identity_idx/);
    expect(identityMigration).toMatch(/where reporter_id is not null/);
    expect(identityMigration).toMatch(/revoke insert on table public\.community_reports from anon, authenticated/);
    expect(identityMigration).toMatch(/drop policy if exists "Reports can be added to published beaches"/);
  });
});
