import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260824180217_internal_beach_reviews.sql"),
  "utf8",
);

describe("internal beach reviews migration contract", () => {
  it("stores one authenticated review per user and beach", () => {
    expect(migration).toMatch(/create table public\.beach_reviews/);
    expect(migration).toMatch(/beach_id uuid not null references public\.beaches\(id\) on delete cascade/);
    expect(migration).toMatch(/user_id uuid not null references auth\.users\(id\) on delete cascade/);
    expect(migration).toMatch(/rating smallint not null check \(rating between 1 and 5\)/);
    expect(migration).toMatch(/body text not null default '' check \(char_length\(body\) <= 500\)/);
    expect(migration).toMatch(/create unique index beach_reviews_beach_user_idx/);
  });

  it("allows public reads only for published beaches and scopes writes to the owner", () => {
    expect(migration).toMatch(/alter table public\.beach_reviews enable row level security/);
    expect(migration).toMatch(/revoke all on table public\.beach_reviews from anon, authenticated, service_role/);
    expect(migration).toMatch(/grant select on table public\.beach_reviews to anon, authenticated/);
    expect(migration).toMatch(/grant select, insert, update, delete on table public\.beach_reviews to authenticated/);
    expect(migration).toMatch(/for select[\s\S]+to anon, authenticated[\s\S]+is_published = true/);
    expect(migration).toMatch(/for insert[\s\S]+to authenticated[\s\S]+\(select auth\.uid\(\)\) = user_id/);
    expect(migration).toMatch(/for update[\s\S]+using \(\(select auth\.uid\(\)\) = user_id\)[\s\S]+with check/);
    expect(migration).toMatch(/for delete[\s\S]+using \(\(select auth\.uid\(\)\) = user_id\)/);
  });
});
