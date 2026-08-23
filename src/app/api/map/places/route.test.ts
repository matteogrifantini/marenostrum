import { describe, expect, it, vi } from "vitest";
import { handleMapPlaces } from "./route";

describe("GET /api/map/places", () => {
  it("returns a focused-viewport hint without calling Overpass", async () => {
    const fetcher = vi.fn();
    const response = await handleMapPlaces(
      new Request(
        "https://marenostrum.app/api/map/places?bbox=35.5,11,39,16&zoom=7&categories=parking",
      ),
      fetcher,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      places: [],
      reason: "zoom-in",
      degraded: false,
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects malformed or unsafe viewports", async () => {
    const response = await handleMapPlaces(
      new Request(
        "https://marenostrum.app/api/map/places?bbox=0,0,1,1&zoom=10&categories=parking",
      ),
      vi.fn(),
    );

    expect(response.status).toBe(400);
  });

  it("queries Overpass and returns only the selected category layers", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          elements: [
            {
              type: "node",
              id: 123,
              lat: 38.1,
              lon: 13.4,
              tags: { amenity: "parking", name: "Parcheggio Porto" },
            },
            {
              type: "node",
              id: 456,
              lat: 38.2,
              lon: 13.5,
              tags: { leisure: "beach_resort", name: "Lido Marina" },
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const response = await handleMapPlaces(
      new Request(
        "https://marenostrum.app/api/map/places?bbox=38,13,38.4,13.8&zoom=10&categories=parking",
      ),
      fetcher,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      places: [
        expect.objectContaining({ id: "node/123", category: "parking" }),
      ],
      degraded: false,
      reason: null,
    });
    const [requestUrl, init] = fetcher.mock.calls[0];
    expect(requestUrl).toContain("?data=");
    expect(decodeURIComponent(requestUrl)).toContain('nwr["amenity"="parking"]');
    expect(decodeURIComponent(requestUrl)).not.toContain("beach_resort");
    expect(init.method).toBe("GET");
  });

  it("returns an honest degraded response when the POI provider fails", async () => {
    const response = await handleMapPlaces(
      new Request(
        "https://marenostrum.app/api/map/places?bbox=38,13,38.4,13.8&zoom=10&categories=lido",
      ),
      vi.fn().mockRejectedValue(new Error("Overpass offline")),
    );

    expect(await response.json()).toEqual({
      places: [],
      reason: "provider-unavailable",
      degraded: true,
    });
  });
});
