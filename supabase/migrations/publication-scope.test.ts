import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260822121539_archive_legacy_demo_beaches.sql"),
  "utf8",
);

describe("publication scope migration", () => {
  it("archives only the three legacy demo beaches without deleting rows", () => {
    expect(migration).toMatch(/update public\.beaches/);
    expect(migration).toMatch(/is_published = false/);
    expect(migration).toMatch(/publication_status = 'archived'/);
    expect(migration).toMatch(/slug in \([\s\S]*cala-del-gelsomino[\s\S]*spiaggia-della-marchesa[\s\S]*tonnara-di-vendicari/);
    expect(migration).not.toMatch(/delete\s+from/i);
    expect(migration).not.toMatch(/drop\s+table/i);
  });
});
