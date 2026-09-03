import { describe, expect, it } from "vitest";
import {
  buildNationalLocationLabel,
  MAP_PAGE_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "./site-copy";

describe("site copy", () => {
  it("exposes national public copy without forcing a regional fallback", () => {
    expect(SITE_NAME).toBe("Mare Nostrum");
    expect(SITE_DESCRIPTION).not.toMatch(/Sicilia/i);
    expect(MAP_PAGE_TITLE).not.toMatch(/Sicilia/i);
    expect(buildNationalLocationLabel("Sicilia", "Palermo")).toBe("Palermo · Sicilia");
    expect(buildNationalLocationLabel(undefined, undefined)).toBe("Italia");
  });
});
