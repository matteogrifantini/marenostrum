import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BeachDetailExperience } from "../../../components/beach-detail-experience";
import { getBeachContentBySlug } from "../../../data/beach-content-repository";
import {
  ForecastDataUnavailableError,
  getBeachBySlug,
  getBeachForecastBundleBySlug,
} from "../../../data/beach-repository";
import { getDateOptions } from "../../../domain/date-selection";
import { normalizeDetailQuery, parseDetailOrigin } from "../../../domain/detail-query";
import { buildBeachDetailContent } from "../../../services/beach-detail-content";
import { getCommunityReportsForBeach } from "../../../services/community-reports";

type DetailSearchParams = {
  date?: string | string[];
  period?: string | string[];
  source?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let beach = null;

  try {
    beach = await getBeachBySlug(slug);
  } catch {
    beach = null;
  }

  if (!beach) {
    return {
      title: "Spiaggia non trovata",
      description: "La spiaggia cercata non è disponibile su Mare Nostrum.",
    };
  }

  const title = `Meteo Mare ${beach.name} (${beach.municipality}) oggi: vento, onde e condizioni`;
  const description = `${beach.name} a ${beach.municipality} (${beach.coast}). Previsioni meteomarine in tempo reale, vento, altezza onde, temperatura acqua e caratteristiche della spiaggia.`;
  const canonicalUrl = `https://marenostrum.app/spiagge/${beach.slug}`;
  const ogImage = beach.image
    ? beach.image.startsWith("http")
      ? beach.image
      : `https://marenostrum.app${beach.image}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Meteo Mare ${beach.name} (${beach.municipality})`,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Mare Nostrum",
      locale: "it_IT",
      images: ogImage ? [{ url: ogImage, alt: beach.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `Meteo Mare ${beach.name} (${beach.municipality})`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BeachPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<DetailSearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const dateOptions = getDateOptions(new Date());
  const normalized = normalizeDetailQuery(
    firstParam(query.date),
    firstParam(query.period),
    dateOptions[0].iso,
  );
  const origin = parseDetailOrigin(firstParam(query.source));
  const period = origin === "home" ? "all-day" : normalized.period;
  const bundlePromise = getBeachForecastBundleBySlug({
    slug,
    date: normalized.date,
    period,
  });
  const beachContentPromise = getBeachContentBySlug(slug).catch((error) => {
    if (!(error instanceof ForecastDataUnavailableError)) throw error;
    return null;
  });
  const communityReportsPromise = getCommunityReportsForBeach(slug);
  let bundle!: Awaited<ReturnType<typeof getBeachForecastBundleBySlug>>;
  let beachContent!: Awaited<ReturnType<typeof getBeachContentBySlug>>;
  let communityReports!: Awaited<ReturnType<typeof getCommunityReportsForBeach>>;

  try {
    [bundle, beachContent, communityReports] = await Promise.all([
      bundlePromise,
      beachContentPromise,
      communityReportsPromise,
    ]);
  } catch (error) {
    if (!(error instanceof ForecastDataUnavailableError)) {
      throw error;
    }

    return (
      <main className="grid min-h-screen place-items-center bg-[var(--sand)] px-6 text-center">
        <section className="max-w-md rounded-[1.75rem] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
            Condizioni non disponibili
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Non riusciamo a caricare questa spiaggia in questo momento. Riprova tra qualche minuto.
          </p>
        </section>
      </main>
    );
  }

  if (!bundle) notFound();

  const detail = buildBeachDetailContent(bundle.beach, beachContent, communityReports);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["Beach", "TouristAttraction"],
    name: bundle.beach.name,
    description: bundle.beach.description,
    url: `https://marenostrum.app/spiagge/${bundle.beach.slug}`,
    image: bundle.beach.image
      ? bundle.beach.image.startsWith("http")
        ? bundle.beach.image
        : `https://marenostrum.app${bundle.beach.image}`
      : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: bundle.beach.municipality,
      addressRegion: "Sicilia",
      addressCountry: "IT",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: bundle.beach.latitude,
      longitude: bundle.beach.longitude,
    },
    publicAccess: true,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BeachDetailExperience
        beach={bundle.beach}
        recommendation={bundle.selected}
        morningRecommendation={bundle.morning}
        afternoonRecommendation={bundle.afternoon}
        dateOptions={dateOptions}
        detail={detail}
        date={normalized.date}
        period={period}
        origin={origin}
        dataUnavailable={bundle.dataUnavailable}
      />
    </>
  );
}

