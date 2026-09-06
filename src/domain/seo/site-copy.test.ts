import { describe, expect, it } from "vitest";
import {
  buildNationalLocationLabel,
  MAP_PAGE_DESCRIPTION,
  MAP_PAGE_TITLE,
  SITE_DESCRIPTION,
  SITE_SOCIAL_IMAGE,
  SITE_TITLE,
  SITE_NAME,
} from "./site-copy";

describe("site copy", () => {
  it("exposes national public copy without forcing a regional fallback", () => {
    expect(SITE_NAME).toBe("Mare Nostrum");
    expect(SITE_TITLE).toBe("Mare Nostrum — Previsioni Meteo Mare, Vento e Onde Spiagge");
    expect(SITE_TITLE.length).toBeLessThanOrEqual(60);
    expect(SITE_DESCRIPTION).not.toMatch(/Sicilia/i);
    expect(SITE_DESCRIPTION).not.toBe(SITE_TITLE);
    expect(SITE_DESCRIPTION.length).toBeGreaterThanOrEqual(140);
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(170);
    expect(MAP_PAGE_TITLE).not.toMatch(/Sicilia/i);
    expect(MAP_PAGE_DESCRIPTION).toBe(
      "Esplora la mappa delle spiagge italiane: confronta vento, onde, temperatura dell’acqua, punti utili e condizioni del mare, regione per regione.",
    );
    expect(SITE_SOCIAL_IMAGE).toBe("https://marenostrum.app/opengraph-image");
    expect(buildNationalLocationLabel("Sicilia", "Palermo")).toBe("Palermo · Sicilia");
    expect(buildNationalLocationLabel(undefined, undefined)).toBe("Italia");
  });
});
