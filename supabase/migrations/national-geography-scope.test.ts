import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260903090527_national_geography_scope.sql"),
  "utf8",
);

function policyBlock(name: string) {
  const start = migration.indexOf(`create policy "${name}"`);
  const end = migration.indexOf("create policy ", start + 1);
  return migration.slice(start, end === -1 ? undefined : end);
}

describe("national geography scope migration contract", () => {
  it("adds country and region metadata and a public scope index", () => {
    expect(migration).toMatch(/add column if not exists country_code/);
    expect(migration).toMatch(/add column if not exists region_code/);
    expect(migration).toMatch(/add column if not exists region_name/);
    expect(migration).toMatch(/add column if not exists province_name/);
    expect(migration).toMatch(/country_code = 'IT'/);
    expect(migration).toMatch(/beaches_public_scope_idx/);
  });

  it("replaces Sicily coordinate and value fences with global geography checks", () => {
    expect(migration).toMatch(/latitude between -90 and 90/);
    expect(migration).toMatch(/longitude between -180 and 180/);
    expect(migration).toMatch(/region_slug_check/);
    expect(migration).not.toMatch(/region = 'Sicilia'/);
    expect(migration).not.toMatch(/province in \('AG', 'CL', 'CT', 'EN', 'ME', 'PA', 'RG', 'SR', 'TP'\)/);
    expect(migration).not.toMatch(/latitude between 35 and 39/);
    expect(migration).not.toMatch(/longitude between 11 and 16/);
  });

  it("gates every public beach-child policy on the publication status", () => {
    for (const name of [
      "Published beach reports are readable",
      "Reports can be added to published beaches",
      "Published beach reviews are readable",
      "Users can create their own beach reviews",
      "Users can update their own beach reviews",
      "Sources for published beaches are readable",
      "Verified parking for published beaches is readable",
      "Published media is readable",
      "Published webcams are readable",
      "Published review profiles are readable",
    ]) {
      expect(policyBlock(name), name).toMatch(/beaches\.is_published = true/);
      expect(policyBlock(name), name).toMatch(
        /beaches\.publication_status in \('verified', 'stale'\)/,
      );
    }
  });

  it("does not add a public view or security-definer escape hatch", () => {
    expect(migration).not.toMatch(/create\s+(or replace\s+)?view\s+public\./i);
    expect(migration).not.toMatch(/security\s+definer/i);
  });
});
