export const MAP_POI_CATEGORIES = ["parking", "lido", "sea-service"] as const;

export type MapPoiCategory = (typeof MAP_POI_CATEGORIES)[number];

export type MapBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type MapPlacesQuery = {
  bbox: MapBounds;
  zoom: number;
  categories: MapPoiCategory[];
};

export type MapPoi = {
  id: string;
  category: MapPoiCategory;
  name: string;
  latitude: number;
  longitude: number;
  sourceUrl: string;
};

type OverpassElement = {
  type?: unknown;
  id?: unknown;
  lat?: unknown;
  lon?: unknown;
  center?: {
    lat?: unknown;
    lon?: unknown;
  };
  tags?: Record<string, unknown>;
};

const SICILY_BOUNDS = {
  south: 35.2,
  west: 10.5,
  north: 39.5,
  east: 16.5,
};

export const MIN_POI_ZOOM = 12.5;
export const MAX_POI_BBOX_AREA = 1.2;
export const MAX_POI_LIMIT = 10;

const CATEGORY_LABELS: Record<MapPoiCategory, string> = {
  parking: "Parcheggio",
  lido: "Lido",
  "sea-service": "Servizio mare",
};

const CATEGORY_FILTERS: Record<MapPoiCategory, string[]> = {
  parking: ['nwr["amenity"="parking"]'],
  lido: ['nwr["leisure"="beach_resort"]'],
  "sea-service": [
    'nwr["amenity"~"boat_rental|toilets|shower|drinking_water"]',
    'nwr["leisure"~"marina|slipway"]',
    'nwr["emergency"="lifeguard"]',
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseCoordinate(value: string | null) {
  if (!value || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBbox(value: string | null): MapBounds {
  const parts = value?.split(",").map((part) => Number(part.trim())) ?? [];

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isFinite(part)) ||
    parts[0] >= parts[2] ||
    parts[1] >= parts[3]
  ) {
    throw new Error("bbox non valido");
  }

  const [south, west, north, east] = parts;
  if (
    south < SICILY_BOUNDS.south ||
    north > SICILY_BOUNDS.north ||
    west < SICILY_BOUNDS.west ||
    east > SICILY_BOUNDS.east
  ) {
    throw new Error("bbox fuori dall'area supportata");
  }

  return { south, west, north, east };
}

export function parseMapPlacesRequest(request: Request): MapPlacesQuery {
  const params = new URL(request.url).searchParams;
  const bbox = parseBbox(params.get("bbox"));
  const zoom = parseCoordinate(params.get("zoom"));

  if (zoom === null || zoom < 0 || zoom > 22) {
    throw new Error("zoom non valido");
  }

  const rawCategories = params.get("categories")?.split(",").map((c) => c.trim()) ?? [];
  const validCategories = rawCategories.filter((c): c is MapPoiCategory =>
    MAP_POI_CATEGORIES.includes(c as MapPoiCategory),
  );

  const categories = validCategories.length > 0 ? validCategories : [...MAP_POI_CATEGORIES];

  return { bbox, zoom, categories };
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function curateMapPlaces(
  places: MapPoi[],
  options?: {
    center?: { latitude: number; longitude: number };
    limit?: number;
  },
): MapPoi[] {
  const limit = options?.limit ?? MAX_POI_LIMIT;
  if (places.length === 0) return [];

  const center = options?.center ?? {
    latitude: places.reduce((sum, p) => sum + p.latitude, 0) / places.length,
    longitude: places.reduce((sum, p) => sum + p.longitude, 0) / places.length,
  };

  const sorted = [...places].sort((a, b) => {
    const distA = calculateDistanceKm(center.latitude, center.longitude, a.latitude, a.longitude);
    const distB = calculateDistanceKm(center.latitude, center.longitude, b.latitude, b.longitude);
    return distA - distB;
  });

  const curated: MapPoi[] = [];
  for (const place of sorted) {
    const isDuplicate = curated.some(
      (existing) =>
        existing.category === place.category &&
        calculateDistanceKm(existing.latitude, existing.longitude, place.latitude, place.longitude) < 0.08,
    );
    if (!isDuplicate) {
      curated.push(place);
    }
    if (curated.length >= limit) break;
  }

  return curated;
}

export function getMapPlacesRequestIssue(query: MapPlacesQuery) {
  if (query.zoom < MIN_POI_ZOOM) return "zoom-in" as const;

  const latitudeSpan = query.bbox.north - query.bbox.south;
  const longitudeSpan = query.bbox.east - query.bbox.west;
  if (latitudeSpan * longitudeSpan > MAX_POI_BBOX_AREA) return "viewport-too-large" as const;

  return null;
}

export function buildOverpassQuery(
  bbox: MapBounds,
  categories: MapPoiCategory[],
) {
  const bboxValue = [bbox.south, bbox.west, bbox.north, bbox.east].join(",");
  const statements = categories.flatMap((category) =>
    CATEGORY_FILTERS[category].map((filter) => `${filter}(${bboxValue});`),
  );

  return [
    "[out:json][timeout:10];",
    "(",
    ...statements,
    ");",
    "out center tags;",
  ].join("\n");
}

function classifyTags(tags: Record<string, unknown>): MapPoiCategory | null {
  if (tags.amenity === "parking") return "parking";
  if (tags.leisure === "beach_resort") return "lido";

  if (
    ["boat_rental", "toilets", "shower", "drinking_water"].includes(String(tags.amenity)) ||
    ["diving", "surfing", "windsurfing", "kitesurfing", "sailing"].includes(String(tags.sport)) ||
    ["marina", "slipway"].includes(String(tags.leisure)) ||
    tags.emergency === "lifeguard"
  ) {
    return "sea-service";
  }

  return null;
}

export function parseOverpassPlaces(
  value: unknown,
  allowedCategories: MapPoiCategory[] = [...MAP_POI_CATEGORIES],
): MapPoi[] {
  if (!Array.isArray(value)) return [];

  const places: MapPoi[] = [];
  const seen = new Set<string>();

  for (const rawElement of value) {
    if (!isRecord(rawElement)) continue;
    const element = rawElement as OverpassElement;
    const type = typeof element.type === "string" ? element.type : null;
    const id = typeof element.id === "number" || typeof element.id === "string" ? String(element.id) : null;
    if (!type || !id || !["node", "way", "relation"].includes(type)) continue;

    const tags = isRecord(element.tags) ? element.tags : {};
    const category = classifyTags(tags);
    if (!category || !allowedCategories.includes(category)) continue;

    const latitude = finiteNumber(element.lat)
      ? element.lat
      : finiteNumber(element.center?.lat)
        ? element.center.lat
        : null;
    const longitude = finiteNumber(element.lon)
      ? element.lon
      : finiteNumber(element.center?.lon)
        ? element.center.lon
        : null;
    if (latitude === null || longitude === null) continue;
    if (latitude < SICILY_BOUNDS.south || latitude > SICILY_BOUNDS.north) continue;
    if (longitude < SICILY_BOUNDS.west || longitude > SICILY_BOUNDS.east) continue;

    const placeId = `${type}/${id}`;
    if (seen.has(placeId)) continue;
    seen.add(placeId);

    const name = typeof tags.name === "string" && tags.name.trim()
      ? tags.name.trim()
      : CATEGORY_LABELS[category];

    places.push({
      id: placeId,
      category,
      name,
      latitude,
      longitude,
      sourceUrl: `https://www.openstreetmap.org/${placeId}`,
    });
  }

  return places;
}
