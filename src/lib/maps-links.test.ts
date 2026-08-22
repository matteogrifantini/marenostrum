import { describe, expect, it } from "vitest";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceUrl,
  buildGoogleMapsSearchUrl,
} from "./maps-links";

describe("maps links", () => {
  it("builds a driving route from valid coordinates", () => {
    expect(buildGoogleMapsDirectionsUrl("38.177057", "12.732108")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=38.177057%2C12.732108&travelmode=driving",
    );
  });

  it("rejects missing or invalid coordinates", () => {
    expect(buildGoogleMapsDirectionsUrl(null, 12.732108)).toBeNull();
    expect(buildGoogleMapsDirectionsUrl(95, 12.732108)).toBeNull();
    expect(buildGoogleMapsDirectionsUrl(38.177057, -181)).toBeNull();
  });

  it("builds a search URL and an optional verified place URL", () => {
    expect(buildGoogleMapsSearchUrl("Cala Rossa, Favignana")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Cala%20Rossa%2C%20Favignana",
    );
    expect(buildGoogleMapsPlaceUrl("Cala Rossa, Favignana", "ChIJexample")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Cala%20Rossa%2C%20Favignana&query_place_id=ChIJexample",
    );
  });
});
