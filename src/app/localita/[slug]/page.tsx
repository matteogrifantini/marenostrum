import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeachCard } from "../../../components/beach-card";
import { MobileNav } from "../../../components/mobile-nav";
import { PageShell } from "../../../components/page-shell";
import {
  ForecastDataUnavailableError,
  getBeachRecommendations,
} from "../../../data/beach-repository";
import { getDateOptions } from "../../../domain/date-selection";
import { filterRecommendationsForHub, getTerritoryHub, TERRITORY_HUBS } from "../../../domain/territory-hubs";
import type { BeachRecommendation } from "../../../domain/beach";

export const revalidate = 300;

export function generateStaticParams() {
  return TERRITORY_HUBS.map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const hub = getTerritoryHub((await params).slug);
  if (!hub) return { title: "Area non trovata" };

  return {
    title: `${hub.name}: vento, onde e condizioni`,
    description: `${hub.description} Previsioni meteomarine aggiornate su Mare Nostrum.`,
    alternates: { canonical: `https://marenostrum.app/localita/${hub.slug}` },
    openGraph: {
      title: `${hub.name} — Mare Nostrum`,
      description: hub.description,
      url: `https://marenostrum.app/localita/${hub.slug}`,
      type: "website",
      siteName: "Mare Nostrum",
      locale: "it_IT",
    },
  };
}

export default async function TerritoryHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const hub = getTerritoryHub((await params).slug);
  if (!hub) notFound();

  const date = getDateOptions(new Date())[0].iso;
  let recommendations: BeachRecommendation[] = [];
  let dataUnavailable = false;

  try {
    recommendations = filterRecommendationsForHub(
      await getBeachRecommendations({ date, period: "all-day" }),
      hub,
    );
  } catch (error) {
    if (!(error instanceof ForecastDataUnavailableError)) throw error;
    dataUnavailable = true;
  }

  return (
    <PageShell activeNav="none">
      <main className="min-h-screen pb-24 lg:pb-10">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-10">
          <header className="mx-auto max-w-3xl">
            <Link href="/" className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sea-deep)] underline underline-offset-4">Mare Nostrum · Sicilia</Link>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{hub.eyebrow}</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">{hub.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{hub.description}</p>
          </header>

          {dataUnavailable ? (
            <section className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] bg-[var(--surface)] p-8 text-center shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
              <h2 className="font-serif text-2xl font-semibold">Condizioni non disponibili</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Le previsioni per {hub.queryLabel} non sono disponibili in questo momento.</p>
            </section>
          ) : recommendations.length ? (
            <>
              <div className="mx-auto mt-8 flex max-w-3xl items-center justify-between gap-4">
                <h2 className="font-serif text-2xl font-semibold tracking-[-0.04em]">Condizioni di oggi</h2>
                <span className="text-xs font-bold text-[var(--muted)]">{recommendations.length} spiagge</span>
              </div>
              <ul aria-label={`Spiagge di ${hub.queryLabel}`} className="mx-auto mt-4 grid max-w-[1100px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
                {recommendations.map((recommendation, index) => (
                  <li key={recommendation.beach.slug} className="min-w-0">
                    <BeachCard recommendation={recommendation} date={date} period="all-day" eager={index < 4} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <section className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] bg-[var(--surface)] p-8 text-center shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
              <h2 className="font-serif text-2xl font-semibold">Catalogo in espansione</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Stiamo verificando le prime spiagge di {hub.queryLabel}. Nel frattempo puoi esplorare la mappa della Sicilia.</p>
              <Link href="/mappa" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-5 text-sm font-extrabold text-white">Apri la mappa</Link>
            </section>
          )}
        </div>
      </main>
      <MobileNav />
    </PageShell>
  );
}
