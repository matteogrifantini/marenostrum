import { describe, expect, it, vi } from "vitest";

import {
  collectForecastIdentityKeys,
  forecastIdentityKey,
  selectDraftForecastBeaches,
} from "./draft-forecast-preload";

describe("selectDraftForecastBeaches", () => {
  it("normalizes only unpublished draft beaches with valid coordinates", () => {
    expect(
      selectDraftForecastBeaches([
        {
          id: "draft-1",
          slug: "spiaggia-uno",
          latitude: "38.123",
          longitude: 13.456,
          is_published: false,
          publication_status: "draft",
        },
        {
          id: "draft-2",
          slug: "spiaggia-due",
          latitude: 37.987,
          longitude: "14.321",
          is_published: false,
          publication_status: "draft",
        },
      ]),
    ).toEqual([
      { id: "draft-1", slug: "spiaggia-uno", latitude: 38.123, longitude: 13.456 },
      { id: "draft-2", slug: "spiaggia-due", latitude: 37.987, longitude: 14.321 },
    ]);
  });

  it("refuses a protected beach before any forecast work can start", () => {
    expect(() =>
      selectDraftForecastBeaches([
        {
          id: "published-1",
          slug: "spiaggia-online",
          latitude: 38.123,
          longitude: 13.456,
          is_published: true,
          publication_status: "published",
        },
      ]),
    ).toThrow("protected");
  });

  it("refuses draft rows with invalid coordinates", () => {
    expect(() =>
      selectDraftForecastBeaches([
        {
          id: "draft-1",
          slug: "spiaggia-senza-coordinate",
          latitude: null,
          longitude: 13.456,
          is_published: false,
          publication_status: "draft",
        },
      ]),
    ).toThrow("coordinates");
  });

  it("uses the same identity for equivalent UTC timestamp formats", () => {
    expect(forecastIdentityKey("draft-1", "2026-08-21T22:00:00.000Z")).toBe(
      forecastIdentityKey("draft-1", "2026-08-21T22:00:00+00:00"),
    );
  });

  it("collects forecast identities across paginated Supabase responses", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce([
        { beach_id: "draft-1", forecast_at: "2026-08-21T22:00:00+00:00" },
        { beach_id: "draft-1", forecast_at: "2026-08-21T23:00:00+00:00" },
      ])
      .mockResolvedValueOnce([
        { beach_id: "draft-1", forecast_at: "2026-08-22T00:00:00+00:00" },
      ]);

    const identities = await collectForecastIdentityKeys(fetchPage, 2);

    expect(identities).toEqual(
      new Set([
        "draft-1:2026-08-21T22:00:00.000Z",
        "draft-1:2026-08-21T23:00:00.000Z",
        "draft-1:2026-08-22T00:00:00.000Z",
      ]),
    );
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage).toHaveBeenNthCalledWith(1, { from: 0, to: 1 });
    expect(fetchPage).toHaveBeenNthCalledWith(2, { from: 2, to: 3 });
  });
});
