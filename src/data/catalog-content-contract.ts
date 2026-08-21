export type SicilianParkingContentRecord = {
  slug: string;
  name: string;
  facility_type: string;
  latitude: number;
  longitude: number;
  pricing_note?: string | null;
  access_note?: string | null;
  source_name: string;
  source_type: string;
  source_url: string;
};

export type SicilianWebcamContentRecord = {
  slug: string;
  name: string;
  provider: string;
  page_url: string;
  latitude: number;
  longitude: number;
  status: "unknown";
  notes: string;
  source_name: string;
  source_type: string;
  source_url: string;
};

export type SicilianMediaContentRecord = {
  slug: string;
  kind: "video" | "embed";
  provider: string;
  provider_item_id: string | null;
  source_url: string;
  media_url: string | null;
  credit: string | null;
  license: string | null;
  notes: string;
};

export type SicilianContentCatalog = {
  parking: SicilianParkingContentRecord[];
  webcams: SicilianWebcamContentRecord[];
  media: SicilianMediaContentRecord[];
};

export type SicilianContentCatalogValidationIssue = {
  index: number;
  collection: "parking" | "webcams" | "media" | "catalog";
  code:
    | "record_not_object"
    | "required_field_missing"
    | "slug_unknown"
    | "source_url_invalid"
    | "coordinates_invalid"
    | "kind_invalid"
    | "media_url_required"
    | "duplicate_source";
  message: string;
};

const SICILY_BOUNDS = {
  minLatitude: 35,
  maxLatitude: 39,
  minLongitude: 11,
  maxLongitude: 16,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasSicilianCoordinates(value: Record<string, unknown>): boolean {
  return (
    typeof value.latitude === "number" &&
    Number.isFinite(value.latitude) &&
    value.latitude >= SICILY_BOUNDS.minLatitude &&
    value.latitude <= SICILY_BOUNDS.maxLatitude &&
    typeof value.longitude === "number" &&
    Number.isFinite(value.longitude) &&
    value.longitude >= SICILY_BOUNDS.minLongitude &&
    value.longitude <= SICILY_BOUNDS.maxLongitude
  );
}

function addIssue(
  issues: SicilianContentCatalogValidationIssue[],
  index: number,
  collection: SicilianContentCatalogValidationIssue["collection"],
  code: SicilianContentCatalogValidationIssue["code"],
  message: string,
) {
  issues.push({ index, collection, code, message });
}

function validateCommonFields(
  value: Record<string, unknown>,
  index: number,
  collection: SicilianContentCatalogValidationIssue["collection"],
  beachSlugs: ReadonlySet<string>,
  seenSources: Set<string>,
  issues: SicilianContentCatalogValidationIssue[],
) {
  if (!isNonEmptyString(value.slug)) {
    addIssue(issues, index, collection, "required_field_missing", "slug is required");
  } else if (!beachSlugs.has(value.slug)) {
    addIssue(issues, index, collection, "slug_unknown", `Unknown beach slug: ${value.slug}`);
  }

  if (!isNonEmptyString(value.source_url)) {
    addIssue(issues, index, collection, "required_field_missing", "source_url is required");
  } else if (!isHttpUrl(value.source_url)) {
    addIssue(issues, index, collection, "source_url_invalid", "source_url must be an HTTP(S) URL");
  } else if (seenSources.has(value.source_url)) {
    addIssue(issues, index, collection, "duplicate_source", `Duplicate source_url: ${value.source_url}`);
  } else {
    seenSources.add(value.source_url);
  }
}

function validateParkingRecord(
  value: unknown,
  index: number,
  beachSlugs: ReadonlySet<string>,
  seenSources: Set<string>,
): { record: SicilianParkingContentRecord | null; issues: SicilianContentCatalogValidationIssue[] } {
  const issues: SicilianContentCatalogValidationIssue[] = [];
  const collection = "parking" as const;

  if (!isRecord(value)) {
    addIssue(issues, index, collection, "record_not_object", "Parking record must be an object");
    return { record: null, issues };
  }

  validateCommonFields(value, index, collection, beachSlugs, seenSources, issues);

  for (const field of ["name", "facility_type", "source_name", "source_type"]) {
    if (!isNonEmptyString(value[field])) {
      addIssue(issues, index, collection, "required_field_missing", `${field} is required`);
    }
  }

  if (!hasSicilianCoordinates(value)) {
    addIssue(
      issues,
      index,
      collection,
      "coordinates_invalid",
      "latitude/longitude must be finite coordinates within Sicily bounds",
    );
  }

  for (const field of ["pricing_note", "access_note"]) {
    if (value[field] !== undefined && !isNullableString(value[field])) {
      addIssue(issues, index, collection, "required_field_missing", `${field} must be a string or null`);
    }
  }

  if (issues.length > 0) return { record: null, issues };
  return { record: value as SicilianParkingContentRecord, issues };
}

function validateWebcamRecord(
  value: unknown,
  index: number,
  beachSlugs: ReadonlySet<string>,
  seenSources: Set<string>,
): { record: SicilianWebcamContentRecord | null; issues: SicilianContentCatalogValidationIssue[] } {
  const issues: SicilianContentCatalogValidationIssue[] = [];
  const collection = "webcams" as const;

  if (!isRecord(value)) {
    addIssue(issues, index, collection, "record_not_object", "Webcam record must be an object");
    return { record: null, issues };
  }

  validateCommonFields(value, index, collection, beachSlugs, seenSources, issues);

  for (const field of ["name", "provider", "page_url", "notes", "source_name", "source_type"]) {
    if (!isNonEmptyString(value[field])) {
      addIssue(issues, index, collection, "required_field_missing", `${field} is required`);
    }
  }

  if (isNonEmptyString(value.page_url) && !isHttpUrl(value.page_url)) {
    addIssue(issues, index, collection, "source_url_invalid", "page_url must be an HTTP(S) URL");
  }

  if (value.status !== "unknown") {
    addIssue(issues, index, collection, "required_field_missing", "webcam candidates must start with status unknown");
  }

  if (!hasSicilianCoordinates(value)) {
    addIssue(
      issues,
      index,
      collection,
      "coordinates_invalid",
      "latitude/longitude must be finite coordinates within Sicily bounds",
    );
  }

  if (issues.length > 0) return { record: null, issues };
  return { record: value as SicilianWebcamContentRecord, issues };
}

function validateMediaRecord(
  value: unknown,
  index: number,
  beachSlugs: ReadonlySet<string>,
  seenSources: Set<string>,
): { record: SicilianMediaContentRecord | null; issues: SicilianContentCatalogValidationIssue[] } {
  const issues: SicilianContentCatalogValidationIssue[] = [];
  const collection = "media" as const;

  if (!isRecord(value)) {
    addIssue(issues, index, collection, "record_not_object", "Media record must be an object");
    return { record: null, issues };
  }

  validateCommonFields(value, index, collection, beachSlugs, seenSources, issues);

  for (const field of ["provider", "notes"]) {
    if (!isNonEmptyString(value[field])) {
      addIssue(issues, index, collection, "required_field_missing", `${field} is required`);
    }
  }

  if (value.kind !== "video" && value.kind !== "embed") {
    addIssue(issues, index, collection, "kind_invalid", "kind must be video or embed");
  }

  if (value.provider_item_id !== null && value.provider_item_id !== undefined && !isNonEmptyString(value.provider_item_id)) {
    addIssue(issues, index, collection, "required_field_missing", "provider_item_id must be a string or null");
  }

  if (value.media_url !== null && value.media_url !== undefined && !isHttpUrl(value.media_url)) {
    addIssue(issues, index, collection, "source_url_invalid", "media_url must be an HTTP(S) URL or null");
  }

  if (value.kind === "video" && !isNonEmptyString(value.media_url)) {
    addIssue(issues, index, collection, "media_url_required", "video candidates require media_url");
  }

  for (const field of ["credit", "license"]) {
    if (!isNullableString(value[field])) {
      addIssue(issues, index, collection, "required_field_missing", `${field} must be a string or null`);
    }
  }

  if (issues.length > 0) return { record: null, issues };
  return { record: value as SicilianMediaContentRecord, issues };
}

export function validateSicilianContentCatalog(
  input: unknown,
  beachSlugs: ReadonlySet<string>,
): { catalog: SicilianContentCatalog; issues: SicilianContentCatalogValidationIssue[] } {
  const emptyCatalog: SicilianContentCatalog = { parking: [], webcams: [], media: [] };
  const issues: SicilianContentCatalogValidationIssue[] = [];

  if (!isRecord(input)) {
    addIssue(issues, -1, "catalog", "record_not_object", "Content catalog must be an object");
    return { catalog: emptyCatalog, issues };
  }

  const parking = input.parking;
  const webcams = input.webcams;
  const media = input.media;

  if (!Array.isArray(parking)) {
    addIssue(issues, -1, "catalog", "required_field_missing", "parking must be an array");
  }
  if (!Array.isArray(webcams)) {
    addIssue(issues, -1, "catalog", "required_field_missing", "webcams must be an array");
  }
  if (!Array.isArray(media)) {
    addIssue(issues, -1, "catalog", "required_field_missing", "media must be an array");
  }

  const parkingRecords: SicilianParkingContentRecord[] = [];
  const webcamRecords: SicilianWebcamContentRecord[] = [];
  const mediaRecords: SicilianMediaContentRecord[] = [];

  if (Array.isArray(parking)) {
    const seenSources = new Set<string>();
    parking.forEach((value, index) => {
      const result = validateParkingRecord(value, index, beachSlugs, seenSources);
      if (result.record) parkingRecords.push(result.record);
      issues.push(...result.issues);
    });
  }

  if (Array.isArray(webcams)) {
    const seenSources = new Set<string>();
    webcams.forEach((value, index) => {
      const result = validateWebcamRecord(value, index, beachSlugs, seenSources);
      if (result.record) webcamRecords.push(result.record);
      issues.push(...result.issues);
    });
  }

  if (Array.isArray(media)) {
    const seenSources = new Set<string>();
    media.forEach((value, index) => {
      const result = validateMediaRecord(value, index, beachSlugs, seenSources);
      if (result.record) mediaRecords.push(result.record);
      issues.push(...result.issues);
    });
  }

  return {
    catalog: { parking: parkingRecords, webcams: webcamRecords, media: mediaRecords },
    issues,
  };
}
