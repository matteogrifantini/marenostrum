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
    expect(buildBeachSeoMetadata(beach)).toMatchObject({
      title: "Meteo del mare a Mondello (Palermo) oggi | Mare Nostrum",
      canonical: "https://marenostrum.app/spiagge/mondello",
      description: expect.stringMatching(/vento|onde|temperatura/i),
    });
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

  it("builds a breadcrumb trail linked to the canonical beach page", () => {
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
          name: "Mondello",
          item: "https://marenostrum.app/spiagge/mondello",
        },
      ],
    });
  });

  it("escapes a closing script opener before embedding JSON-LD", () => {
    expect(serializeJsonLd({ text: "</script>" })).toContain("\\u003c/script>");
  });
});
