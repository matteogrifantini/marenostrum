const PRODUCTION_ORIGIN = "https://marenostrum.app";
const DEVELOPMENT_ORIGIN = "http://localhost:3000";
const TRUSTED_PRODUCTION_HOST = /(^|\.)marenostrum\.app$|(^|\.)vercel\.app$/i;

type AuthOriginOptions = {
  configuredSiteUrl?: string;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  production?: boolean;
  requestOrigin?: string;
};

function normalizeOrigin(value: string | null | undefined, production: boolean) {
  if (!value?.trim()) return null;

  const candidate = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (production && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function safeAuthNext(value: string | null | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/impostazioni";
}

export function getAuthOrigin(options: AuthOriginOptions = {}) {
  const production = options.production ?? process.env.NODE_ENV === "production";
  const configured = normalizeOrigin(
    options.configuredSiteUrl ?? process.env.NEXT_PUBLIC_SITE_URL,
    production,
  );
  if (configured) return configured;

  const forwardedHost = options.forwardedHost?.split(",")[0]?.trim();
  if (forwardedHost && (!production || TRUSTED_PRODUCTION_HOST.test(forwardedHost.split(":")[0]))) {
    const protocol = options.forwardedProto?.split(",")[0]?.trim() || (production ? "https" : "http");
    const forwardedOrigin = normalizeOrigin(`${protocol}://${forwardedHost}`, production);
    if (forwardedOrigin) return forwardedOrigin;
  }

  const requestOrigin = normalizeOrigin(options.requestOrigin, production);
  if (requestOrigin) return requestOrigin;

  return production ? PRODUCTION_ORIGIN : DEVELOPMENT_ORIGIN;
}

export function getRequestAuthOrigin(request: Request, options: Pick<AuthOriginOptions, "production" | "configuredSiteUrl"> = {}) {
  return getAuthOrigin({
    ...options,
    requestOrigin: new URL(request.url).origin,
    forwardedHost: request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
  });
}

export function buildAuthRedirectUrl(
  origin: string,
  next = "/impostazioni",
  options: Pick<AuthOriginOptions, "configuredSiteUrl" | "production"> = {},
) {
  const callback = new URL(
    "/auth/callback",
    getAuthOrigin({ ...options, requestOrigin: origin }),
  );
  callback.searchParams.set("next", safeAuthNext(next));
  return callback.toString();
}
