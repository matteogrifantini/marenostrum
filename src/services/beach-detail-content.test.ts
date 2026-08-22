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
      { emoji: "•", label: "Dettaglio", value: "Sabbia chiara" },
      { emoji: "•", label: "Dettaglio", value: "Fondale basso" },
    ]);
    expect(detail.reviews).toBeNull();
    expect(detail.reviewProfile).toEqual({
      provider: "google",
      mapsUrl: "https://maps.google.com/?cid=1",
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
        { emoji: "•", label: "Dettaglio", value: "Sabbia chiara" },
        { emoji: "•", label: "Dettaglio", value: "Fondale basso" },
      ],
      reviews: null,
      reviewProfile: null,
      recentPhotos: [],
      reels: [],
      webcam: null,
    });
  });
});
