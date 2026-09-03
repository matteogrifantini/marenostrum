export const SITE_NAME = "Mare Nostrum";
export const SITE_DESCRIPTION = "Meteo del mare e condizioni delle spiagge in Italia | Mare Nostrum";
export const MAP_PAGE_TITLE = "Scegli una zona";
export const MAP_PAGE_DESCRIPTION = "Mappa delle spiagge e delle condizioni del mare";

export function buildNationalLocationLabel(regionName?: string, provinceName?: string) {
  const parts = [provinceName, regionName].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  return parts.length > 0 ? parts.join(" · ") : "Italia";
}
