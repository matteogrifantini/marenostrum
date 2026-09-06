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
  const municipalityPart =
    beach.municipality && beach.municipality !== beach.name ? ` (${beach.municipality})` : "";
  const title = `Meteo ${beach.name} oggi${municipalityPart}: Vento, Mare e Onde | Mare Nostrum`;
  const description =
    `Previsioni meteo e mare a ${beach.name}${municipalityPart} per oggi: ` +
    "intensità del vento, altezza onde, temperatura dell’acqua e condizioni della spiaggia per scegliere quando andare.";
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
  const itemListElement = [
    {
      "@type": "ListItem" as const,
      position: 1,
      name: "Mare Nostrum",
      item: MARE_NOSTRUM_URL,
    },
  ];

  if (beach.regionName) {
    itemListElement.push({
      "@type": "ListItem" as const,
      position: itemListElement.length + 1,
      name: beach.regionName,
      item: `${MARE_NOSTRUM_URL}/?region=${encodeURIComponent(beach.regionSlug ?? "sicilia")}`,
    });
  }

  if (beach.municipality && beach.municipality.toLowerCase() === "favignana") {
    itemListElement.push({
      "@type": "ListItem" as const,
      position: itemListElement.length + 1,
      name: "Favignana",
      item: `${MARE_NOSTRUM_URL}/localita/favignana`,
    });
  }

  itemListElement.push({
    "@type": "ListItem" as const,
    position: itemListElement.length + 1,
    name: beach.name,
    item: canonical,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement,
  };
}

export function serializeJsonLd(value: unknown) {
  return (JSON.stringify(value) ?? "").replace(/</g, "\\u003c");
}
