import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getRequestAuthOrigin, safeAuthNext } from "../../../lib/auth-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeAuthNext(url.searchParams.get("next"));
  const origin = getRequestAuthOrigin(request);

  if (code) {
    const client = await createClient();
    if (client) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/impostazioni?auth=error", origin));
}
