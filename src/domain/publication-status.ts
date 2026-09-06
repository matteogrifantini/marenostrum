export const PUBLIC_BEACH_PUBLICATION_STATUSES = ["verified", "stale"] as const;

export type PublicationStatus = "draft" | "verified" | "stale" | "archived";

export function isPublicBeachPublicationStatus(
  value: string | null | undefined,
): value is "verified" | "stale" {
  return value === "verified" || value === "stale";
}
