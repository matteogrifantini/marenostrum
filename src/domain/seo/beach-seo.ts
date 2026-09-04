import type { Beach } from "../beach";

export const MARE_NOSTRUM_URL = "https://marenostrum.app";

export type BeachSeoMetadata = {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
};

function canonicalFor(beach: Beach) {
  return `${MARE_NOSTRUM_URL}/spiagge/${encodeURIComponent(beach.slug)}`;
}

function absoluteAssetUrl(value: string) {
  return value.startsWith("http") ? value : `${MARE_NOSTRUM_URL}${value}`;
}

export function buildBeachSeoMetadata(beach: Beach): BeachSeoMetadata {
  const title = `Meteo del mare a ${beach.name} (${beach.municipality}) oggi | Mare Nostrum`;
  const description =
    `Previsioni del mare oggi a ${beach.name}, ${beach.municipality}: ` +
    "vento, onde, temperatura dell’acqua e condizioni della spiaggia.";
  const canonical = canonicalFor(beach);

  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
  };
}

export function buildBeachJsonLd(beach: Beach) {
  const canonical = canonicalFor(beach);
  const hasCoordinates =
    typeof beach.latitude === "number" &&
    Number.isFinite(beach.latitude) &&
    typeof beach.longitude === "number" &&
    Number.isFinite(beach.longitude);

  return {
    "@context": "https://schema.org",
    "@type": ["Beach", "TouristAttraction"],
    "@id": `${canonical}#beach`,
    name: beach.name,
    description: beach.description,
    url: canonical,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
      url: canonical,
    },
    identifier: beach.slug,
    ...(beach.image ? { image: absoluteAssetUrl(beach.image) } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: beach.municipality,
      ...(beach.regionName ? { addressRegion: beach.regionName } : {}),
      addressCountry: "IT",
    },
    ...(hasCoordinates
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: beach.latitude,
            longitude: beach.longitude,
          },
        }
      : {}),
    publicAccess: true,
  };
}

export function buildBeachBreadcrumbJsonLd(beach: Beach) {
  const canonical = canonicalFor(beach);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Mare Nostrum",
        item: MARE_NOSTRUM_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: beach.name,
        item: canonical,
      },
    ],
  };
}

export function serializeJsonLd(value: unknown) {
  return (JSON.stringify(value) ?? "").replace(/</g, "\\u003c");
}
