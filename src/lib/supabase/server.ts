import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  ForecastDataUnavailableError,
  type BeachConditionRow,
  type BeachRow,
  type DataSourceRow,
  type ForecastReadStore,
} from "../../data/beach-repository";
import type {
  BeachContentReadStore,
  BeachSourceRow,
  MediaItemRow,
  ParkingFacilityRow,
  ReviewProfileRow,
  WebcamRow,
} from "../../data/beach-content-repository";
import { getSupabasePublicConfig } from "./config";

export async function createClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always mutate cookies; middleware handles refreshes.
        }
      },
    },
  });
}

function throwReadError(message: string): never {
  throw new ForecastDataUnavailableError(message);
}

export async function createSupabaseForecastReadStore(): Promise<ForecastReadStore> {
  if (!getSupabasePublicConfig()) {
    throw new ForecastDataUnavailableError("Supabase public configuration is missing");
  }

  const client = await createClient();

  if (!client) {
    throw new ForecastDataUnavailableError("Supabase public configuration is missing");
  }

  return {
    async getPublishedBeaches() {
      const { data, error } = await client
        .from("beaches")
        .select(
          "id, slug, name, municipality, coast, description, orientation_degrees, orientation_label, shelter, tags, access_level, image_path, image_alt, image_credit, image_license, latitude, longitude, services, warnings, facts",
        )
        .eq("is_published", true);

      if (error) throwReadError("Published beaches are unavailable");
      return (data ?? []) as BeachRow[];
    },

    async getSourceBySlug(slug) {
      const { data, error } = await client
        .from("data_sources")
        .select("id, slug, quality")
        .eq("slug", slug)
        .eq("is_public", true)
        .maybeSingle();

      if (error) throwReadError("Forecast source is unavailable");
      return data as DataSourceRow | null;
    },

    async getForecastRows(input) {
      let query = client
        .from("beach_conditions")
        .select(
          "beach_id, source_id, observed_at, forecast_at, wind_direction_degrees, wind_speed_kmh, gust_speed_kmh, wave_height_meters, wave_direction_degrees, weather, weather_code, temperature_celsius, apparent_temperature_celsius, water_temperature_celsius, cloud_cover_percent, precipitation_probability_percent",
        )
        .eq("source_id", input.sourceId)
        .gte("forecast_at", input.from)
        .lt("forecast_at", input.to);

      if (input.beachId) {
        query = query.eq("beach_id", input.beachId);
      }

      const { data, error } = await query;

      if (error) throwReadError("Forecast data is unavailable");
      return (data ?? []) as BeachConditionRow[];
    },
  };
}

export async function createSupabaseBeachContentReadStore(): Promise<BeachContentReadStore> {
  if (!getSupabasePublicConfig()) {
    throw new ForecastDataUnavailableError("Supabase public configuration is missing");
  }

  const client = await createClient();

  if (!client) {
    throw new ForecastDataUnavailableError("Supabase public configuration is missing");
  }

  return {
    async getPublishedBeachBySlug(slug) {
      const { data, error } = await client
        .from("beaches")
        .select("id")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throwReadError("Published beach content is unavailable");
      return data as { id: string } | null;
    },

    async getBeachSources(beachId) {
      const { data, error } = await client
        .from("beach_sources")
        .select("id, beach_id, source_name, source_type, source_url, is_primary, source_hash, checked_at, next_check_at, notes")
        .eq("beach_id", beachId)
        .order("is_primary", { ascending: false });

      if (error) throwReadError("Beach sources are unavailable");
      return (data ?? []) as BeachSourceRow[];
    },

    async getParkingFacilities(beachId) {
      const { data, error } = await client
        .from("parking_facilities")
        .select("id, beach_id, source_id, name, facility_type, latitude, longitude, pricing_note, access_note, official_url, content_status, checked_at, expires_at")
        .eq("beach_id", beachId)
        .in("content_status", ["verified", "stale"])
        .order("checked_at", { ascending: false, nullsFirst: false });

      if (error) throwReadError("Parking content is unavailable");
      return (data ?? []) as ParkingFacilityRow[];
    },

    async getMediaItems(beachId) {
      const { data, error } = await client
        .from("media_items")
        .select("id, beach_id, source_id, kind, provider, provider_item_id, source_url, media_url, storage_path, thumbnail_url, credit, license, captured_at, verified_at, expires_at, publication_status")
        .eq("beach_id", beachId)
        .in("publication_status", ["verified", "stale"])
        .order("verified_at", { ascending: false, nullsFirst: false });

      if (error) throwReadError("Beach media is unavailable");
      return (data ?? []) as MediaItemRow[];
    },

    async getWebcams(beachId) {
      const { data, error } = await client
        .from("webcams")
        .select("id, beach_id, source_id, name, provider, page_url, snapshot_url, stream_url, latitude, longitude, status, content_status, last_checked_at, next_check_at, notes")
        .eq("beach_id", beachId)
        .in("content_status", ["verified", "stale"])
        .order("last_checked_at", { ascending: false, nullsFirst: false });

      if (error) throwReadError("Webcam content is unavailable");
      return (data ?? []) as WebcamRow[];
    },

    async getReviewProfiles(beachId) {
      const { data, error } = await client
        .from("review_profiles")
        .select("id, beach_id, provider, place_id, maps_url, verification_status, checked_at, next_check_at, notes")
        .eq("beach_id", beachId)
        .in("verification_status", ["verified", "stale"])
        .order("checked_at", { ascending: false, nullsFirst: false });

      if (error) throwReadError("Review profile is unavailable");
      return (data ?? []) as ReviewProfileRow[];
    },
  };
}
