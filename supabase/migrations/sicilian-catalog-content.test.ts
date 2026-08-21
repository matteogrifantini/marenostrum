import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260821143849_sicilian_catalog_content.sql"),
  "utf8",
);

describe("Sicilian catalog content migration contract", () => {
  it("adds publication metadata without removing the current beach gate", () => {
    expect(migration).toMatch(/alter table public\.beaches[\s\S]+add column if not exists region_slug/);
    expect(migration).toMatch(/add column if not exists province_code/);
    expect(migration).toMatch(/add column if not exists publication_status/);
    expect(migration).toMatch(/add column if not exists last_verified_at/);
    expect(migration).toMatch(/add column if not exists next_review_at/);
    expect(migration).toMatch(/update public\.beaches[\s\S]+publication_status[\s\S]+is_published/);
    expect(migration).toMatch(/create index beaches_publication_status_idx/);
  });

  it("creates provenance and normalized content tables", () => {
    expect(migration).toMatch(/create table public\.beach_sources/);
    expect(migration).toMatch(/create table public\.parking_facilities/);
    expect(migration).toMatch(/create table public\.media_items/);
    expect(migration).toMatch(/create table public\.webcams/);
    expect(migration).toMatch(/create table public\.review_profiles/);
    expect(migration).toMatch(/create table public\.content_refresh_runs/);
    expect(migration).toMatch(/unique\s*\(\s*beach_id,\s*source_url\s*\)/);
    expect(migration).toMatch(/kind text not null check \(kind in \('photo', 'video', 'embed'\)\)/);
    expect(migration).toMatch(/place_id text/);
    expect(migration).toMatch(/error_summary text/);
  });

  it("enables RLS, exposes only non-draft content for published beaches, and keeps writes server-side", () => {
    for (const table of [
      "beach_sources",
      "parking_facilities",
      "media_items",
      "webcams",
      "review_profiles",
      "content_refresh_runs",
    ]) {
      expect(migration).toMatch(new RegExp(`alter table public\\.${table} enable row level security`));
    }

    expect(migration).toMatch(/for select[\s\S]+is_published = true[\s\S]+publication_status in \('verified', 'stale'\)/);
    expect(migration).toMatch(/grant select on table public\.beach_sources,[\s\S]+public\.review_profiles to anon, authenticated/);
    expect(migration).toMatch(/revoke all on table public\.beach_sources,[\s\S]+public\.content_refresh_runs[\s\S]+from anon, authenticated, service_role/);
    expect(migration).toMatch(/grant all on table public\.beach_sources,[\s\S]+public\.content_refresh_runs to service_role/);
    expect(migration).toMatch(/content_refresh_runs[\s\S]*revoke all/);
  });

  it("indexes expiry and refresh scheduling fields", () => {
    expect(migration).toMatch(/parking_facilities_beach_status_expiry_idx/);
    expect(migration).toMatch(/media_items_beach_status_expiry_idx/);
    expect(migration).toMatch(/webcams_beach_status_check_idx/);
    expect(migration).toMatch(/content_refresh_runs_source_started_idx/);
  });
});
