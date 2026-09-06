export const SITE_NAME = "Mare Nostrum";
export const SITE_URL = "https://marenostrum.app";
export const SITE_TITLE = "Mare Nostrum — Previsioni Meteo Mare, Vento e Onde Spiagge";
export const SITE_DESCRIPTION =
  "Mare Nostrum è la guida meteomarina alle spiagge d’Italia: scopri in tempo reale vento, altezza onde, temperatura acqua e dove il mare è calmo oggi.";
export const SITE_SOCIAL_IMAGE = `${SITE_URL}/opengraph-image`;
export const MAP_PAGE_TITLE = "Mappa delle spiagge d’Italia";
export const MAP_PAGE_DESCRIPTION =
  "Esplora la mappa delle spiagge italiane: confronta vento, onde, temperatura dell’acqua, punti utili e condizioni del mare, regione per regione.";

export function buildNationalLocationLabel(regionName?: string, provinceName?: string) {
  const parts = [provinceName, regionName].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  return parts.length > 0 ? parts.join(" · ") : "Italia";
}
