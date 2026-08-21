import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260821145741_sicilian_catalog_content_integrity.sql"),
  "utf8",
);

describe("Sicilian catalog content integrity migration contract", () => {
  it("indexes every content-to-source foreign key", () => {
    expect(migration).toMatch(/parking_facilities_source_idx/);
    expect(migration).toMatch(/media_items_source_idx/);
    expect(migration).toMatch(/webcams_source_idx/);
  });

  it("keeps refresh-run records explicitly denied to public roles", () => {
    expect(migration).toMatch(/create policy "Refresh runs are server-only"/);
    expect(migration).toMatch(/on public\.content_refresh_runs[\s\S]+for all[\s\S]+using \(false\)[\s\S]+with check \(false\)/);
  });

});
