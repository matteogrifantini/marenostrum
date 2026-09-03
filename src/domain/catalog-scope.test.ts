import { describe, expect, it } from "vitest";

import { parseCatalogScope } from "./catalog-scope";

describe("catalog scope", () => {
  it("parses a valid province scope", () => {
    expect(parseCatalogScope(new URLSearchParams("province=PA"))).toEqual({
      kind: "province",
      provinceCode: "PA",
    });
  });

  it("parses a valid nearby scope", () => {
    expect(
      parseCatalogScope(new URLSearchParams("lat=38.1157&lng=13.3615&radius=25")),
    ).toEqual({
      kind: "nearby",
      latitude: 38.1157,
      longitude: 13.3615,
      radiusKm: 25,
    });
  });

  it.each([
    "lat=38.1157&lng=13.3615&radius=0",
    "lat=38.1157&lng=13.3615&radius=101",
    "lat=not-a-number&lng=13.3615&radius=25",
    "lat=38.1157&lng=Infinity&radius=25",
  ])("rejects malformed nearby scope %s", (query) => {
    expect(parseCatalogScope(new URLSearchParams(query))).toBeNull();
  });

  it("rejects an unknown province and conflicting scope parameters", () => {
    expect(parseCatalogScope(new URLSearchParams("province=ZZ"))).toBeNull();
    expect(parseCatalogScope(new URLSearchParams("region=IT-82&province=PA"))).toBeNull();
  });
});
