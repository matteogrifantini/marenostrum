type CoordinateValue = number | string | null | undefined;

function normalizeCoordinate(value: CoordinateValue) {
  if (value === null || value === undefined || value === "") return null;

  const parsed = typeof value === "string" ? Number(value.trim()) : value;
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildGoogleMapsDirectionsUrl(
  latitude: CoordinateValue,
  longitude: CoordinateValue,
) {
  const normalizedLatitude = normalizeCoordinate(latitude);
  const normalizedLongitude = normalizeCoordinate(longitude);

  if (
    normalizedLatitude === null ||
    normalizedLongitude === null ||
    normalizedLatitude < -90 ||
    normalizedLatitude > 90 ||
    normalizedLongitude < -180 ||
    normalizedLongitude > 180
  ) {
    return null;
  }

  const destination = `${normalizedLatitude},${normalizedLongitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

export function buildGoogleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

export function buildGoogleMapsPlaceUrl(query: string, placeId: string | null | undefined) {
  const normalizedPlaceId = placeId?.trim();
  if (!normalizedPlaceId) return buildGoogleMapsSearchUrl(query);

  return `${buildGoogleMapsSearchUrl(query)}&query_place_id=${encodeURIComponent(normalizedPlaceId)}`;
}
