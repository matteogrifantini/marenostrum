import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const packageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
) as { scripts: Record<string, string> };

describe("national catalog script wiring", () => {
  it("points canonical catalog commands at generic script names", () => {
    expect(packageJson.scripts["catalog:validate"]).toContain("scripts/import-catalog.ts");
    expect(packageJson.scripts["catalog:master:validate"]).toContain("scripts/import-master-catalog.ts");
    expect(packageJson.scripts["catalog:readiness"]).toContain("scripts/check-publication-readiness.ts");
    expect(packageJson.scripts["catalog:forecast:preload"]).toContain("scripts/preload-draft-forecasts.ts");
    expect(packageJson.scripts["catalog:content:validate"]).toContain("scripts/import-content.ts");
    expect(packageJson.scripts["catalog:reviews:validate"]).toContain("scripts/import-reviews.ts");
    expect(packageJson.scripts["catalog:images:validate"]).toContain("scripts/import-images.ts");
    expect(packageJson.scripts["catalog:images:media:validate"]).toContain("scripts/import-image-media.ts");
  });

  it("does not wire a canonical command to a regional script path", () => {
    const canonicalCatalogScripts = Object.entries(packageJson.scripts)
      .filter(([name]) => name.startsWith("catalog:"))
      .map(([, command]) => command)
      .join("\n");

    expect(canonicalCatalogScripts).not.toMatch(/scripts\/[^\s]*sicil/iu);
  });
});
