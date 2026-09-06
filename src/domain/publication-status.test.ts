import { describe, expect, it } from "vitest";
import {
  isPublicBeachPublicationStatus,
  PUBLIC_BEACH_PUBLICATION_STATUSES,
} from "./publication-status";

describe("public beach publication status", () => {
  it("keeps verified and stale rows public while hiding draft and archived rows", () => {
    expect(PUBLIC_BEACH_PUBLICATION_STATUSES).toEqual(["verified", "stale"]);
    expect(isPublicBeachPublicationStatus("verified")).toBe(true);
    expect(isPublicBeachPublicationStatus("stale")).toBe(true);
    expect(isPublicBeachPublicationStatus("draft")).toBe(false);
    expect(isPublicBeachPublicationStatus("archived")).toBe(false);
    expect(isPublicBeachPublicationStatus(undefined)).toBe(false);
  });
});
