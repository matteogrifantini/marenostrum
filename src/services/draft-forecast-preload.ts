export type DraftForecastBeachRow = {
  id: string;
  slug: string;
  latitude: number | string | null;
  longitude: number | string | null;
  is_published: boolean;
  publication_status: string;
};

export type DraftForecastBeach = {
  id: string;
  slug: string;
  latitude: number;
  longitude: number;
};

export type ForecastIdentityRow = {
  beach_id: string;
  forecast_at: string;
};

export type ForecastPageFetcher = (range: {
  from: number;
  to: number;
}) => Promise<ForecastIdentityRow[]>;

export function forecastIdentityKey(beachId: string, forecastAt: string): string {
  const timestamp = new Date(forecastAt);

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error(`Forecast timestamp is invalid for beach ${beachId}`);
  }

  return `${beachId}:${timestamp.toISOString()}`;
}

export async function collectForecastIdentityKeys(
  fetchPage: ForecastPageFetcher,
  pageSize = 1000,
): Promise<Set<string>> {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error("Forecast page size must be a positive integer");
  }

  const identities = new Set<string>();

  for (let from = 0; ; from += pageSize) {
    const rows = await fetchPage({ from, to: from + pageSize - 1 });

    for (const row of rows) {
      identities.add(forecastIdentityKey(row.beach_id, row.forecast_at));
    }

    if (rows.length < pageSize) return identities;
  }
}

function normalizeCoordinate(value: number | string | null): number | null {
  if (value === null || value === "") return null;

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

export function selectDraftForecastBeaches(
  rows: DraftForecastBeachRow[],
): DraftForecastBeach[] {
  const protectedRows = rows.filter(
    (row) => row.is_published || row.publication_status !== "draft",
  );

  if (protectedRows.length > 0) {
    throw new Error(
      `Refusing forecast preload for protected beaches: ${protectedRows
        .map((row) => row.slug)
        .join(", ")}`,
    );
  }

  return rows.map((row) => {
    const latitude = normalizeCoordinate(row.latitude);
    const longitude = normalizeCoordinate(row.longitude);

    if (latitude === null || longitude === null) {
      throw new Error(`Draft beach ${row.slug} has invalid coordinates`);
    }

    return {
      id: row.id,
      slug: row.slug,
      latitude,
      longitude,
    };
  });
}
