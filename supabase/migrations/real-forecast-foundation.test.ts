import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260820102545_real_forecast_foundation.sql",
);
const seedPath = resolve(process.cwd(), "supabase/seed.sql");

describe("real forecast source identity contract", () => {
  it("keeps Open-Meteo's stable UUID in migration and seed", () => {
    const migration = readFileSync(migrationPath, "utf8");
    const seed = readFileSync(seedPath, "utf8");

    expect(migration).toMatch(
      /insert into public\.data_sources \(id, slug, name, url, quality, is_public\)[\s\S]+?values \([\s\S]*?'00000000-0000-0000-0000-000000000002',\s*'open-meteo'/,
    );
    expect(seed).toContain(
      "'00000000-0000-0000-0000-000000000002', 'open-meteo'",
    );

    const sourceInsert = migration.match(
      /insert into public\.data_sources[\s\S]*?on conflict \(slug\) do update[\s\S]*?;/,
    )?.[0];

    expect(sourceInsert).toBeDefined();
    expect(sourceInsert).not.toMatch(/\bid\s*=\s*excluded\.id/);
  });
});
