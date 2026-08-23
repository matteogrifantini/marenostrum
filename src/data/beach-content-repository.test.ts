import { describe, expect, it } from "vitest";
import {
  getBeachContentBySlug,
  type BeachContentReadStore,
  type BeachSourceRow,
  type MediaItemRow,
  type ParkingFacilityRow,
  type ReviewProfileRow,
  type WebcamRow,
} from "./beach-content-repository";

const source: BeachSourceRow = {
  id: "source-1",
  beach_id: "beach-1",
  source_name: "Comune",
  source_type: "municipality",
  source_url: "https://example.com/beach",
  is_primary: true,
  source_hash: null,
  checked_at: "2026-08-21T08:00:00.000Z",
  next_check_at: "2026-09-21T08:00:00.000Z",
  notes: null,
};

const parking: ParkingFacilityRow = {
  id: "parking-1",
  beach_id: "beach-1",
  source_id: source.id,
  name: "Area comunale",
  facility_type: "public",
  latitude: null,
  longitude: null,
  pricing_note: null,
  access_note: "650 m dalla spiaggia",
  official_url: source.source_url,
  content_status: "verified",
  checked_at: "2026-08-01T08:00:00.000Z",
  expires_at: "2026-08-31T08:00:00.000Z",
};

const media: MediaItemRow = {
  id: "media-1",
  beach_id: "beach-1",
  source_id: source.id,
  kind: "photo",
  provider: "municipality",
  provider_item_id: null,
  source_url: source.source_url,
  media_url: "https://example.com/beach.jpg",
  storage_path: null,
  thumbnail_url: null,
  credit: "Comune",
  license: "CC BY 4.0",
  captured_at: null,
  verified_at: "2026-08-21T08:00:00.000Z",
  expires_at: null,
  publication_status: "verified",
};

const webcam: WebcamRow = {
  id: "webcam-1",
  beach_id: "beach-1",
  source_id: source.id,
  name: "Webcam del porto",
  provider: "municipality",
  page_url: "https://example.com/webcam",
  snapshot_url: null,
  stream_url: null,
  latitude: null,
  longitude: null,
  status: "offline",
  content_status: "stale",
  last_checked_at: "2026-08-20T08:00:00.000Z",
  next_check_at: "2026-08-21T08:00:00.000Z",
  notes: null,
};

const reviewProfile: ReviewProfileRow = {
  id: "review-1",
  beach_id: "beach-1",
  provider: "google",
  place_id: "ChIJexample",
  maps_url: "https://maps.google.com/?cid=1",
  verification_status: "verified",
  checked_at: "2026-08-21T08:00:00.000Z",
  next_check_at: "2026-09-21T08:00:00.000Z",
  notes: null,
};

function createStore(overrides: Partial<BeachContentReadStore> = {}): BeachContentReadStore {
  return {
    getPublishedBeachBySlug: async (slug) =>
      slug === "san-vito-lo-capo" ? { id: "beach-1" } : null,
    getBeachSources: async () => [source],
    getParkingFacilities: async () => [parking],
    getMediaItems: async () => [media],
    getWebcams: async () => [webcam],
    getReviewProfiles: async () => [reviewProfile],
    ...overrides,
  };
}

describe("beach content repository", () => {
  it("returns separate sourced content collections for a published beach", async () => {
    const content = await getBeachContentBySlug("san-vito-lo-capo", createStore());

    expect(content).toEqual({
      sources: [source],
      parkings: [parking],
      media: [media],
      webcams: [webcam],
      reviewProfile,
    });
  });

  it("does not query or synthesize content for an unpublished or unknown beach", async () => {
    const getBeachSources = async () => {
      throw new Error("content must not be queried");
    };

    await expect(
      getBeachContentBySlug("unknown", createStore({ getBeachSources })),
    ).resolves.toBeNull();
  });

  it("returns only parking that is verified and no longer marked as a candidate", async () => {
    const content = await getBeachContentBySlug(
      "san-vito-lo-capo",
      createStore({
        getParkingFacilities: async () => [
          parking,
          {
            ...parking,
            id: "parking-stale",
            content_status: "stale",
          },
          {
            ...parking,
            id: "parking-candidate",
            name: "Parcheggio candidato da verificare",
            content_status: "verified",
          },
        ],
      }),
    );

    expect(content?.parkings).toEqual([parking]);
  });

  it("keeps an unavailable review profile empty instead of inventing local reviews", async () => {
    const content = await getBeachContentBySlug(
      "san-vito-lo-capo",
      createStore({ getReviewProfiles: async () => [] }),
    );

    expect(content?.reviewProfile).toBeNull();
  });
});
