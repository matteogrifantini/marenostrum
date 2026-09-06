export type BeachContentStatus = "draft" | "verified" | "stale" | "archived";

export type BeachSourceRow = {
  id: string;
  beach_id: string;
  source_name: string;
  source_type: string;
  source_url: string;
  is_primary: boolean;
  source_hash: string | null;
  checked_at: string;
  next_check_at: string;
  notes: string | null;
};

export type ParkingFacilityRow = {
  id: string;
  beach_id: string;
  source_id: string | null;
  name: string;
  facility_type: string;
  latitude: number | string | null;
  longitude: number | string | null;
  pricing_note: string | null;
  access_note: string | null;
  official_url: string | null;
  content_status: BeachContentStatus;
  checked_at: string | null;
  expires_at: string | null;
};

export type MediaItemRow = {
  id: string;
  beach_id: string;
  source_id: string | null;
  kind: "photo" | "video" | "embed";
  provider: string;
  provider_item_id: string | null;
  source_url: string;
  media_url: string | null;
  storage_path: string | null;
  thumbnail_url: string | null;
  credit: string | null;
  license: string | null;
  captured_at: string | null;
  verified_at: string | null;
  expires_at: string | null;
  publication_status: BeachContentStatus;
};

export type WebcamRow = {
  id: string;
  beach_id: string;
  source_id: string | null;
  name: string;
  provider: string;
  page_url: string;
  snapshot_url: string | null;
  stream_url: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  status: "online" | "offline" | "unknown" | "stale";
  content_status: BeachContentStatus;
  last_checked_at: string | null;
  next_check_at: string | null;
  notes: string | null;
};

export type ReviewProfileRow = {
  id: string;
  beach_id: string;
  provider: string;
  place_id: string | null;
  maps_url: string;
  verification_status: BeachContentStatus;
  checked_at: string | null;
  next_check_at: string | null;
  notes: string | null;
  rating?: number | string | null;
  review_count?: number | string | null;
};

export type InternalReviewRow = {
  id: string;
  beach_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
};

export type BeachContentReadStore = {
  getPublishedBeachBySlug(slug: string): Promise<{ id: string } | null>;
  getBeachSources(beachId: string): Promise<BeachSourceRow[]>;
  getParkingFacilities(beachId: string): Promise<ParkingFacilityRow[]>;
  getMediaItems(beachId: string): Promise<MediaItemRow[]>;
  getWebcams(beachId: string): Promise<WebcamRow[]>;
  getReviewProfiles(beachId: string): Promise<ReviewProfileRow[]>;
  getInternalReviews?(beachId: string): Promise<InternalReviewRow[]>;
};

export type BeachContent = {
  sources: BeachSourceRow[];
  parkings: ParkingFacilityRow[];
  media: MediaItemRow[];
  webcams: WebcamRow[];
  reviewProfile: ReviewProfileRow | null;
  reviews?: InternalReviewRow[];
};

const parkingNeedsVerification = /(?:candidat|da\s+(?:verificare|controllare|confermare)|non\s+verificat|provvisor)/i;

export function isPublishableParking(row: ParkingFacilityRow) {
  const descriptiveText = `${row.name} ${row.access_note ?? ""} ${row.pricing_note ?? ""}`;
  return row.content_status === "verified" && !parkingNeedsVerification.test(descriptiveText);
}

async function resolveStore(store: BeachContentReadStore | undefined) {
  if (store) return store;

  const { createSupabaseBeachContentReadStore } = await import("../lib/supabase/server");
  return createSupabaseBeachContentReadStore();
}

export async function getBeachContentBySlug(
  slug: string,
  providedStore?: BeachContentReadStore,
): Promise<BeachContent | null> {
  const store = await resolveStore(providedStore);
  const beach = await store.getPublishedBeachBySlug(slug);

  if (!beach) return null;

  const [sources, parkings, media, webcams, reviewProfiles, reviews] = await Promise.all([
    store.getBeachSources(beach.id),
    store.getParkingFacilities(beach.id),
    store.getMediaItems(beach.id),
    store.getWebcams(beach.id),
    store.getReviewProfiles(beach.id),
    store.getInternalReviews ? store.getInternalReviews(beach.id) : Promise.resolve([]),
  ]);

  return {
    sources,
    parkings: parkings.filter(isPublishableParking),
    media,
    webcams,
    reviewProfile: reviewProfiles[0] ?? null,
    reviews,
  };
}
