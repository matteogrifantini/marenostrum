import {
  buildOverpassQuery,
  getMapPlacesRequestIssue,
  parseMapPlacesRequest,
  parseOverpassPlaces,
} from "../../../../domain/map-poi";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

type MapPlacesFetcher = typeof fetch;

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export async function handleMapPlaces(
  request: Request,
  fetcher: MapPlacesFetcher = fetch,
): Promise<Response> {
  let query;
  try {
    query = parseMapPlacesRequest(request);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Parametri mappa non validi" },
      { status: 400 },
    );
  }

  const issue = getMapPlacesRequestIssue(query);
  if (issue) {
    return json({ places: [], reason: issue, degraded: false });
  }

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const overpassQuery = buildOverpassQuery(query.bbox, query.categories);
      const response = await fetcher(
        `${endpoint}?data=${encodeURIComponent(overpassQuery)}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "user-agent": "MareNostrum/1.0 (https://marenostrum.app)",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(12000),
        },
      );

      if (!response.ok) continue;

      const payload: unknown = await response.json();
      const elements =
        typeof payload === "object" && payload !== null && "elements" in payload
          ? (payload as { elements?: unknown }).elements
          : [];

      return json({
        places: parseOverpassPlaces(elements, query.categories),
        reason: null,
        degraded: false,
      });
    } catch {
      continue;
    }
  }

  return json({ places: [], reason: "provider-unavailable", degraded: true });
}

export async function GET(request: Request) {
  return handleMapPlaces(request);
}
