import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    return null;
  }

  browserClient ??= createBrowserClient(config.url, config.key);
  return browserClient;
}
