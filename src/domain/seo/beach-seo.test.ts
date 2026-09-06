import { describe, expect, it } from "vitest";

import type { Beach } from "../beach";
import {
  buildBeachBreadcrumbJsonLd,
  buildBeachJsonLd,
  buildBeachSeoMetadata,
  serializeJsonLd,
} from "./beach-seo";

const beach: Beach = {
  slug: "mondello",
  name: "Mondello",
  municipality: "Palermo",
  countryCode: "IT",
  regionCode: "IT-82",
  regionName: "Sicilia",
  regionSlug: "sicilia",
  provinceCode: "PA",
  provinceName: "Palermo",
  coast: "Nord",
  description: "Una spiaggia ampia con acqua limpida e fondale sabbioso.",
  orientationDegrees: 270,
  shelter: ["scirocco"],
  tags: ["relax"],
  access: "facile",
  image: "/images/beaches/mondello.jpg",
  imageAlt: "La spiaggia di Mondello.",
  latitude: 38.205,
  longitude: 13.322,
};

describe("beach SEO", () => {
  it("builds a stable beach-specific title, description, and canonical", () => {
    const seo = buildBeachSeoMetadata(beach);
    expect(seo).toMatchObject({
      title: "Meteo Mondello (Palermo): Mare e Vento | Mare Nostrum",
      canonical: "https://marenostrum.app/spiagge/mondello",
      description: expect.stringMatching(/Meteo mare a Mondello \(Palermo\) oggi.*vento.*onde/i),
    });
    expect(seo.title.length).toBeLessThanOrEqual(60);
    expect(seo.description.length).toBeLessThanOrEqual(158);
  });

  it("strictly enforces Google SERP length constraints (< 60 chars title, <= 158 chars description) for long names", () => {
    const longBeach: Beach = {
      ...beach,
      name: "Spiaggia dell'Isola dei Conigli",
      municipality: "Lampedusa e Linosa",
    };
    const seo = buildBeachSeoMetadata(longBeach);
    expect(seo.title.length).toBeLessThanOrEqual(60);
    expect(seo.description.length).toBeLessThanOrEqual(158);
    expect(seo.title).toContain("Mare Nostrum");

    const sameMuniBeach: Beach = {
      ...beach,
      name: "San Vito Lo Capo",
      municipality: "San Vito Lo Capo",
    };
    const sameMuniSeo = buildBeachSeoMetadata(sameMuniBeach);
    expect(sameMuniSeo.title).toBe("Meteo San Vito Lo Capo: Mare, Vento e Onde | Mare Nostrum");
    expect(sameMuniSeo.title.length).toBeLessThanOrEqual(60);
    expect(sameMuniSeo.description.length).toBeLessThanOrEqual(158);
  });

  it("uses verified dynamic geography without a regional fallback", () => {
    const jsonLd = buildBeachJsonLd(beach) as {
      address?: { addressRegion?: string; addressCountry?: string };
    };

    expect(jsonLd.address).toMatchObject({
      addressRegion: "Sicilia",
      addressCountry: "IT",
    });
    expect(JSON.stringify(buildBeachJsonLd({ ...beach, regionName: undefined }))).not.toMatch(
      /addressRegion.:.Sicilia/,
    );
  });

  it("builds a hierarchical breadcrumb trail linked to the canonical beach page", () => {
    expect(buildBeachBreadcrumbJsonLd(beach)).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": "https://marenostrum.app/spiagge/mondello#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Mare Nostrum",
          item: "https://marenostrum.app",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Sicilia",
          item: "https://marenostrum.app/?region=sicilia",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Mondello",
          item: "https://marenostrum.app/spiagge/mondello",
        },
      ],
    });

    const favignanaBeach: Beach = {
      ...beach,
      slug: "cala-rossa-favignana",
      name: "Cala Rossa",
      municipality: "Favignana",
    };
    const favignanaBreadcrumb = buildBeachBreadcrumbJsonLd(favignanaBeach);
    expect(favignanaBreadcrumb.itemListElement.map((item) => item.name)).toEqual([
      "Mare Nostrum",
      "Sicilia",
      "Favignana",
      "Cala Rossa",
    ]);
  });

  it("escapes a closing script opener before embedding JSON-LD", () => {
    expect(serializeJsonLd({ text: "</script>" })).toContain("\\u003c/script>");
  });
});
