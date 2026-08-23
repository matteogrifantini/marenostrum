import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260823061325_synced_favorites.sql"),
  "utf8",
);

describe("synced favorites migration contract", () => {
  it("stores favorites by authenticated user and beach slug", () => {
    expect(migration).toMatch(/create table public\.user_favorites/);
    expect(migration).toMatch(/user_id uuid not null references auth\.users\(id\) on delete cascade/);
    expect(migration).toMatch(/beach_slug text not null references public\.beaches\(slug\) on delete cascade/);
    expect(migration).toMatch(/unique \(user_id, beach_slug\)/);
  });

  it("exposes only ownership-scoped operations to authenticated users", () => {
    expect(migration).toMatch(/alter table public\.user_favorites enable row level security/);
    expect(migration).toMatch(/revoke all on table public\.user_favorites from anon, authenticated, service_role/);
    expect(migration).toMatch(/grant select, insert, delete on table public\.user_favorites to authenticated/);
    expect(migration).toMatch(/using \(\(select auth\.uid\(\)\) = user_id\)/g);
    expect(migration).toMatch(/with check \(\(select auth\.uid\(\)\) = user_id\)/);
    expect(migration).not.toMatch(/to anon/);
  });
});
