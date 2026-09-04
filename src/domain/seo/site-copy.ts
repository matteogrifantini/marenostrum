export const SITE_NAME = "Mare Nostrum";
export const SITE_URL = "https://marenostrum.app";
export const SITE_TITLE = "Meteo mare Italia: vento, onde e spiagge | Mare Nostrum";
export const SITE_DESCRIPTION =
  "Previsioni meteo mare in Italia: confronta vento, onde, temperatura dell’acqua e condizioni aggiornate per scegliere dove andare oggi, spiaggia per spiaggia.";
export const SITE_SOCIAL_IMAGE = `${SITE_URL}/opengraph-image`;
export const MAP_PAGE_TITLE = "Mappa delle spiagge d’Italia";
export const MAP_PAGE_DESCRIPTION = "Esplora le spiagge d’Italia e le condizioni del mare";

export function buildNationalLocationLabel(regionName?: string, provinceName?: string) {
  const parts = [provinceName, regionName].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  return parts.length > 0 ? parts.join(" · ") : "Italia";
}
