import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const serviceWorker = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8");

describe("PWA service worker", () => {
  it("keeps forecast APIs network-only and provides an offline navigation fallback", () => {
    expect(serviceWorker).toContain("url.pathname.startsWith(\"/api/\")");
    expect(serviceWorker).toContain("const OFFLINE_URL = \"/offline\"");
    expect(serviceWorker).toContain("caches.match(OFFLINE_URL)");
    expect(serviceWorker).toContain("request.mode !== \"navigate\"");
  });
});
