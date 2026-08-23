import { describe, expect, it } from "vitest";
import type { Beach } from "../domain/beach";
import type {
  BeachContent,
  ParkingFacilityRow,
  WebcamRow,
} from "../data/beach-content-repository";
import { buildBeachDetailContent } from "./beach-detail-content";

const beach: Beach = {
  slug: "san-vito-lo-capo",
  name: "San Vito Lo Capo",
  municipality: "San Vito Lo Capo",
  coast: "Nord-ovest",
  description: "Una spiaggia aperta e luminosa.",
  orientationDegrees: 270,
  shelter: ["maestrale"],
  tags: ["relax"],
  access: "facile",
  latitude: 38.1749,
  longitude: 12.7343,
  facts: ["Sabbia chiara", "Fondale basso"],
};

const parking: ParkingFacilityRow = {
  id: "parking-1",
  beach_id: "beach-1",
  source_id: "source-1",
  name: "Area comunale",
  facility_type: "public",
  latitude: null,
  longitude: null,
  pricing_note: "€5 al giorno",
  access_note: "650 m · 8 min a piedi",
  official_url: "https://example.com/parking",
  content_status: "verified",
  checked_at: "2026-08-21T08:00:00.000Z",
  expires_at: "2026-09-21T08:00:00.000Z",
};

const webcam: WebcamRow = {
  id: "webcam-1",
  beach_id: "beach-1",
  source_id: "source-1",
  name: "Webcam del porto",
  provider: "municipality",
  page_url: "https://example.com/webcam",
  snapshot_url: null,
  stream_url: null,
  latitude: "38.1749",
  longitude: "12.7343",
  status: "offline",
  content_status: "stale",
  last_checked_at: "2026-08-20T08:00:00.000Z",
  next_check_at: "2026-08-21T08:00:00.000Z",
  notes: null,
};

const content: BeachContent = {
  sources: [
    {
      id: "source-1",
      beach_id: "beach-1",
      source_name: "OpenStreetMap",
      source_type: "osm-parking",
      source_url: "https://www.openstreetmap.org/way/123",
      is_primary: false,
      source_hash: null,
      checked_at: "2026-08-21T08:00:00.000Z",
      next_check_at: "2026-09-21T08:00:00.000Z",
      notes: null,
    },
  ],
  parkings: [parking],
  media: [],
  webcams: [webcam],
  reviewProfile: {
    id: "review-1",
    beach_id: "beach-1",
    provider: "google",
    place_id: "ChIJexample",
    maps_url: "https://maps.google.com/?cid=1",
    verification_status: "verified",
    checked_at: "2026-08-21T08:00:00.000Z",
    next_check_at: "2026-09-21T08:00:00.000Z",
    notes: null,
  },
};

describe("buildBeachDetailContent", () => {
  it("maps only real catalog data and keeps reviews as an external profile", () => {
    const reports = [
      {
        id: "report-1",
        emoji: "🌊",
        title: "Mare pulito",
        detail: "Acqua trasparente",
        age: "adesso",
      },
    ];

    const detail = buildBeachDetailContent(beach, content, reports);

    expect(detail.reports).toEqual(reports);
    expect(detail.parkings).toEqual([
      {
        id: "parking-1",
        name: "Area comunale",
        price: "€5 al giorno",
        type: "Parcheggio pubblico",
        walking: "650 m · 8 min a piedi",
        updated: "Verificato 2026-08-21",
        sourceUrl: "https://www.openstreetmap.org/way/123",
      },
    ]);
    expect(detail.facts).toEqual([
      { emoji: "🏖️", label: "Fondo", value: "Sabbia chiara" },
      { emoji: "🌊", label: "Fondale", value: "Fondale basso" },
    ]);
    expect(detail.reviews).toBeNull();
    expect(detail.reviewProfile).toEqual({
      provider: "google",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=San%20Vito%20Lo%20Capo%2C%20San%20Vito%20Lo%20Capo%2C%20Sicilia&query_place_id=ChIJexample",
      verificationStatus: "verified",
    });
    expect(detail.webcam).toMatchObject({
      name: "Webcam del porto",
      distanceKm: 0,
      pageUrl: "https://example.com/webcam",
      live: false,
      updated: "Ultimo controllo 2026-08-20",
    });
    expect(detail.recentPhotos).toEqual([]);
    expect(detail.reels).toEqual([]);
  });

  it("turns parking coordinates into a Google Maps driving route", () => {
    const detail = buildBeachDetailContent(
      beach,
      {
        ...content,
        parkings: [
          {
            ...parking,
            latitude: "38.177057",
            longitude: "12.732108",
          },
        ],
      },
      [],
    );

    expect(detail.parkings[0]).toMatchObject({
      latitude: 38.177057,
      longitude: 12.732108,
      directionsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=38.177057%2C12.732108&travelmode=driving",
    });
  });

  it("falls back to a Google Maps search when a review place is not verified", () => {
    const detail = buildBeachDetailContent(
      beach,
      {
        ...content,
        reviewProfile: {
          ...content.reviewProfile!,
          place_id: null,
          maps_url: "https://maps.google.com/?cid=stale",
          verification_status: "draft",
        },
      },
      [],
    );

    expect(detail.reviewProfile).toEqual({
      provider: "google",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=San%20Vito%20Lo%20Capo%2C%20San%20Vito%20Lo%20Capo%2C%20Sicilia",
      verificationStatus: "draft",
    });
  });

  it("returns honest empty sections when no public child content exists", () => {
    const emptyContent: BeachContent = {
      sources: [],
      parkings: [],
      media: [],
      webcams: [],
      reviewProfile: null,
    };

    expect(buildBeachDetailContent(beach, emptyContent, [])).toEqual({
      reports: [],
      parkings: [],
      facts: [
        { emoji: "🏖️", label: "Fondo", value: "Sabbia chiara" },
        { emoji: "🌊", label: "Fondale", value: "Fondale basso" },
      ],
      reviews: null,
      reviewProfile: null,
      recentPhotos: [],
      reels: [],
      webcam: null,
    });
  });

  it("classifies rocky and walking-access facts with specific categories", () => {
    const detail = buildBeachDetailContent(
      {
        ...beach,
        facts: [
          "Cala rocciosa",
          "Accesso indicato come difficile dalla fonte turistica",
        ],
      },
      null,
      [],
    );

    expect(detail.facts).toEqual([
      { emoji: "🪨", label: "Fondo", value: "Cala rocciosa" },
      {
        emoji: "🥾",
        label: "Accesso",
        value: "Accesso indicato come difficile dalla fonte turistica",
      },
    ]);
  });

  it("keeps water-entry and seabed facts in distinct categories", () => {
    const detail = buildBeachDetailContent(
      {
        ...beach,
        facts: ["Ingresso in acqua facile", "Fondale inizialmente basso", "Acqua limpida"],
      },
      null,
      [],
    );

    expect(detail.facts).toEqual([
      { emoji: "🥾", label: "Accesso", value: "Ingresso in acqua facile" },
      { emoji: "🌊", label: "Fondale", value: "Fondale inizialmente basso" },
      { emoji: "🌊", label: "Acqua", value: "Acqua limpida" },
    ]);
  });

  it("renders explicit beach-information categories without repeating the prefix", () => {
    const detail = buildBeachDetailContent(
      {
        ...beach,
        facts: [
          "Suolo — ciottoli chiari e roccia",
          "Fondale — profondo vicino alla riva",
          "Esposizione — Nord-ovest",
          "Servizi — Nessun servizio stabile verificato",
          "Accesso — Sentiero e discesa rocciosa",
          "Ambiente — Macchia mediterranea e costa selvaggia",
        ],
      },
      null,
      [],
    );

    expect(detail.facts).toEqual([
      { emoji: "🪨", label: "Suolo", value: "ciottoli chiari e roccia" },
      { emoji: "🌊", label: "Fondale", value: "profondo vicino alla riva" },
      { emoji: "🧭", label: "Esposizione", value: "Nord-ovest" },
      { emoji: "🧺", label: "Servizi", value: "Nessun servizio stabile verificato" },
      { emoji: "🥾", label: "Accesso", value: "Sentiero e discesa rocciosa" },
      { emoji: "🌿", label: "Ambiente", value: "Macchia mediterranea e costa selvaggia" },
    ]);
  });
});
