import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  ForecastDataUnavailableError,
  type BeachConditionRow,
  type BeachRow,
  type DataSourceRow,
  type ForecastReadStore,
} from "../../data/beach-repository";
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
