import type { Beach } from "./beach";
import type { CatalogScope } from "./catalog-scope";

export type LatLngBounds = [[number, number], [number, number]];

export const ITALY_MAP_BOUNDS: LatLngBounds = [
  [35.2, 6.5],
  [47.2, 19.0],
];

const KM_PER_LATITUDE_DEGREE = 111.32;

function finiteCoordinate(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value);
}

function nearbyBounds(scope: Extract<CatalogScope, { kind: "nearby" }>): LatLngBounds {
  const latitudePadding = scope.radiusKm / KM_PER_LATITUDE_DEGREE;
  const longitudeScale = Math.max(Math.cos((scope.latitude * Math.PI) / 180), 0.2);
  const longitudePadding = scope.radiusKm / (KM_PER_LATITUDE_DEGREE * longitudeScale);

  return [
    [scope.latitude - latitudePadding, scope.longitude - longitudePadding],
    [scope.latitude + latitudePadding, scope.longitude + longitudePadding],
  ];
}

export function getMapBounds(
  beaches: readonly Beach[],
  scope: CatalogScope | null,
): LatLngBounds {
  const coordinates = beaches.flatMap(({ latitude, longitude }) =>
    finiteCoordinate(latitude) && finiteCoordinate(longitude)
      ? [[latitude, longitude] as [number, number]]
      : [],
  );

  if (coordinates.length === 0) {
    return scope?.kind === "nearby" ? nearbyBounds(scope) : ITALY_MAP_BOUNDS;
  }

  const latitudes = coordinates.map(([latitude]) => latitude);
  const longitudes = coordinates.map(([, longitude]) => longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeSpan = Math.max(maxLatitude - minLatitude, 0.12);
  const longitudeSpan = Math.max(maxLongitude - minLongitude, 0.12);
  const latitudePadding = Math.max(latitudeSpan * 0.12, 0.08);
  const longitudePadding = Math.max(longitudeSpan * 0.12, 0.08);

  return [
    [minLatitude - latitudePadding, minLongitude - longitudePadding],
    [maxLatitude + latitudePadding, maxLongitude + longitudePadding],
  ];
}
