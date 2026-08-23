import { describe, expect, it } from "vitest";
import {
  buildOverpassQuery,
  parseMapPlacesRequest,
  parseOverpassPlaces,
} from "./map-poi";

describe("map POI contract", () => {
  it("normalizes Overpass nodes, ways and relations into useful sea places", () => {
    const places = parseOverpassPlaces([
      {
        type: "node",
        id: 101,
        lat: 38.11,
        lon: 13.36,
        tags: { amenity: "parking", name: "Parcheggio Cala" },
      },
      {
        type: "way",
        id: 202,
        center: { lat: 38.12, lon: 13.37 },
        tags: { leisure: "beach_resort", name: "Lido del Sole" },
      },
      {
        type: "relation",
        id: 303,
        center: { lat: 38.13, lon: 13.38 },
        tags: { amenity: "shower", name: "Docce spiaggia" },
      },
      {
        type: "node",
        id: 404,
        lat: 38.14,
        lon: 13.39,
        tags: { amenity: "restaurant", name: "Ristorante" },
      },
    ]);

    expect(places).toEqual([
      expect.objectContaining({
        id: "node/101",
        category: "parking",
        name: "Parcheggio Cala",
        latitude: 38.11,
        longitude: 13.36,
        sourceUrl: "https://www.openstreetmap.org/node/101",
      }),
      expect.objectContaining({
        id: "way/202",
        category: "lido",
        name: "Lido del Sole",
      }),
      expect.objectContaining({
        id: "relation/303",
        category: "sea-service",
        name: "Docce spiaggia",
      }),
    ]);
    expect(places).toHaveLength(3);
  });

  it("accepts only a valid, focused map viewport and selected categories", () => {
    const request = parseMapPlacesRequest(
      new Request(
        "https://marenostrum.app/api/map/places?bbox=37.8,13.1,38.3,13.8&zoom=10&categories=parking,lido",
      ),
    );

    expect(request).toEqual({
      bbox: { south: 37.8, west: 13.1, north: 38.3, east: 13.8 },
      zoom: 10,
      categories: ["parking", "lido"],
    });
  });

  it("builds a bounded Overpass query for exactly the requested layers", () => {
    const query = buildOverpassQuery(
      { south: 37.8, west: 13.1, north: 38.3, east: 13.8 },
      ["parking", "lido"],
    );

    expect(query).toContain('nwr["amenity"="parking"](37.8,13.1,38.3,13.8);');
    expect(query).toContain('nwr["leisure"="beach_resort"](37.8,13.1,38.3,13.8);');
    expect(query).not.toContain('nwr["amenity"~="boat_rental');
  });

  it("uses Overpass regex filters for the sea-service layer", () => {
    const query = buildOverpassQuery(
      { south: 37.8, west: 13.1, north: 38.3, east: 13.8 },
      ["sea-service"],
    );

    expect(query).toContain('nwr["amenity"~"boat_rental|toilets|shower|drinking_water"]');
    expect(query).not.toContain('nwr["amenity"~="');
    expect(query).not.toContain('nwr["sport"');
  });
});
