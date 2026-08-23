import type { Metadata } from "next";
import { FavoritesExperience } from "../../components/favorites-experience";
import { MobileNav } from "../../components/mobile-nav";
import { PageShell } from "../../components/page-shell";
import {
  ForecastDataUnavailableError,
  getBeachRecommendations,
} from "../../data/beach-repository";
import { getDateOptions } from "../../domain/date-selection";
import type { BeachRecommendation } from "../../domain/beach";

export const metadata: Metadata = {
  title: "Spiagge preferite",
  description: "Ritrova le spiagge che hai salvato su Mare Nostrum.",
  alternates: { canonical: "https://marenostrum.app/preferiti" },
};

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const dateOptions = getDateOptions(new Date());
  const date = dateOptions[0].iso;
  let recommendations: BeachRecommendation[] = [];
  let dataUnavailable = false;

  try {
    recommendations = await getBeachRecommendations({ date, period: "all-day" });
  } catch (error) {
    if (!(error instanceof ForecastDataUnavailableError)) throw error;
    dataUnavailable = true;
  }

  return (
    <PageShell activeNav="none">
      <FavoritesExperience date={date} period="all-day" recommendations={recommendations} dataUnavailable={dataUnavailable} />
      <MobileNav active="impostazioni" />
    </PageShell>
  );
}
