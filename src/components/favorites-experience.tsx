"use client";

import { Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import { BeachCard } from "./beach-card";
import { FAVORITES_STORAGE_KEY } from "./favorite-toggle";

type FavoritesExperienceProps = {
  date: string;
  period: BeachPeriod;
  recommendations: BeachRecommendation[];
  dataUnavailable?: boolean;
};

function readFavorites() {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) && parsed.every((value): value is string => typeof value === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function FavoritesExperience({
  date,
  period,
  recommendations,
  dataUnavailable = false,
}: FavoritesExperienceProps) {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const favoriteRecommendations = useMemo(
    () => recommendations.filter(({ beach }) => favoriteSlugs.includes(beach.slug)),
    [favoriteSlugs, recommendations],
  );

  useEffect(() => {
    const sync = () => setFavoriteSlugs(readFavorites());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("marenostrum:favorites:changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("marenostrum:favorites:changed", sync);
    };
  }, []);

  return (
    <main className="min-h-screen pb-24 lg:pb-10">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-10">
        <header className="mx-auto max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sea-deep)]">La tua selezione</p>
          <h1 className="mt-2 flex items-center gap-3 font-serif text-4xl font-semibold tracking-[-0.06em]"><Heart aria-hidden="true" className="text-[var(--score-poor)]" fill="currentColor" size={30} /> Preferiti</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Le spiagge salvate restano su questo dispositivo. Accedi dalle impostazioni per sincronizzarle.</p>
        </header>

        {dataUnavailable ? (
          <div className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] bg-[var(--surface)] p-8 text-center shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
            <h2 className="font-serif text-2xl font-semibold">Condizioni non disponibili</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">I preferiti sono salvati, ma le previsioni non sono disponibili in questo momento.</p>
          </div>
        ) : favoriteRecommendations.length ? (
          <ul aria-label="Spiagge preferite" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {favoriteRecommendations.map((recommendation, index) => (
              <li key={recommendation.beach.slug} className="min-w-0">
                <BeachCard recommendation={recommendation} date={date} period={period} eager={index < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] bg-[var(--surface)] p-8 text-center shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
            <h2 className="font-serif text-2xl font-semibold">Ancora nessun preferito</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Tocca il cuore su una card o in una scheda spiaggia per ritrovarla qui.</p>
          </div>
        )}
      </div>
    </main>
  );
}
