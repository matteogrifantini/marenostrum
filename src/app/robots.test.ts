import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows all search engines and disallows private api routes while declaring sitemap", () => {
    const result = robots();

    expect(result).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      sitemap: "https://marenostrum.app/sitemap.xml",
    });
  });
});
