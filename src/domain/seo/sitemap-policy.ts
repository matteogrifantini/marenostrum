export const MIN_INDEXABLE_TERRITORY_BEACHES = 2;

export function hasUniqueTerritoryHubDescription(description: string) {
  const normalized = description.trim();
  return normalized.length >= 60 && !/pagina pronta ad accogliere|prossime spiagge verificate/i.test(normalized);
}

export function shouldIndexTerritoryHub({
  publishedBeachCount,
  hasUniqueDescription,
}: {
  publishedBeachCount: number;
  hasUniqueDescription: boolean;
}) {
  return publishedBeachCount >= MIN_INDEXABLE_TERRITORY_BEACHES && hasUniqueDescription;
}
