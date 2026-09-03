import { getProvinceLabel, getRegionLabel } from "./province-filter";

const ITALIAN_REGION_CODES = new Set([
  "IT-21", "IT-23", "IT-25", "IT-32", "IT-34", "IT-36", "IT-42", "IT-45", "IT-52", "IT-55",
  "IT-57", "IT-62", "IT-65", "IT-67", "IT-72", "IT-75", "IT-77", "IT-78", "IT-82", "IT-88",
]);

// Includes current and historically used codes so imported records remain addressable.
const ITALIAN_PROVINCE_CODES = new Set([
  "AG", "AL", "AN", "AO", "AP", "AQ", "AR", "AT", "AV", "BA", "BG", "BI", "BL", "BN",
  "BO", "BR", "BS", "BT", "BZ", "CA", "CB", "CE", "CH", "CL", "CN", "CO", "CR", "CS",
  "CT", "CZ", "EN", "FC", "FE", "FG", "FI", "FM", "FR", "GE", "GO", "GR", "IM", "IS",
  "KR", "LC", "LE", "LI", "LO", "LT", "LU", "MB", "MC", "ME", "MI", "MN", "MO", "MS",
  "NA", "NO", "NU", "OG", "OR", "OT", "PA", "PC", "PD", "PE", "PG", "PI", "PN", "PO",
  "PR", "PT", "PU", "PV", "PZ", "RA", "RC", "RE", "RG", "RI", "RM", "RN", "RO", "SA",
  "SI", "SO", "SP", "SR", "SS", "SU", "SV", "TA", "TE", "TN", "TO", "TP", "TR", "TS",
  "TV", "UD", "VA", "VB", "VC", "VE", "VI", "VR", "VS", "VT",
]);

export type CatalogScope =
  | { kind: "region"; regionCode: string }
  | { kind: "province"; provinceCode: string }
  | { kind: "nearby"; latitude: number; longitude: number; radiusKm: number };

export function formatCatalogScopeLabel(scope: CatalogScope | null) {
  if (!scope) return "Italia";
  if (scope.kind === "region") return `Regione ${getRegionLabel(scope.regionCode)}`;
  if (scope.kind === "province") return `Provincia di ${getProvinceLabel(scope.provinceCode)}`;
  return `${scope.radiusKm} km da te`;
}

function singleValue(input: URLSearchParams, key: string) {
  const values = input.getAll(key);
  return values.length === 1 ? values[0].trim() : null;
}

function parseFinite(value: string | null) {
  if (!value || value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseCatalogScope(input: URLSearchParams): CatalogScope | null {
  const region = singleValue(input, "region");
  const province = singleValue(input, "province");
  const latitude = singleValue(input, "lat");
  const longitude = singleValue(input, "lng");
  const radius = singleValue(input, "radius");
  const hasRegion = input.has("region");
  const hasProvince = input.has("province");
  const hasNearby = ["lat", "lng", "radius"].some((key) => input.has(key));
  const scopeCount = Number(hasRegion) + Number(hasProvince) + Number(hasNearby);

  if (scopeCount > 1) return null;

  if (hasRegion) {
    const normalizedRegion = region?.toUpperCase();
    return normalizedRegion && ITALIAN_REGION_CODES.has(normalizedRegion)
      ? { kind: "region", regionCode: normalizedRegion }
      : null;
  }

  if (hasProvince) {
    const normalizedProvince = province?.toUpperCase();
    return normalizedProvince && ITALIAN_PROVINCE_CODES.has(normalizedProvince)
      ? { kind: "province", provinceCode: normalizedProvince }
      : null;
  }

  if (!hasNearby) return null;

  const parsedLatitude = parseFinite(latitude);
  const parsedLongitude = parseFinite(longitude);
  const parsedRadius = parseFinite(radius);

  if (
    parsedLatitude === null ||
    parsedLongitude === null ||
    parsedRadius === null ||
    parsedLatitude < -90 ||
    parsedLatitude > 90 ||
    parsedLongitude < -180 ||
    parsedLongitude > 180 ||
    parsedRadius < 1 ||
    parsedRadius > 100
  ) {
    return null;
  }

  return {
    kind: "nearby",
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    radiusKm: parsedRadius,
  };
}
