"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export const FAVORITES_STORAGE_KEY = "marenostrum:favorites:v1";

type FavoriteToggleProps = {
  beachSlug: string;
  beachName: string;
  className?: string;
};

function readFavoriteSlugs() {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) && parsed.every((value): value is string => typeof value === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function writeFavoriteSlugs(slugs: string[]) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...new Set(slugs)].sort()));
  } catch {
    // localStorage can be unavailable in private browsing or restricted contexts.
  }
}

export function FavoriteToggle({ beachSlug, beachName, className = "" }: FavoriteToggleProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const syncFavorite = () => {
      setIsFavorite(readFavoriteSlugs().includes(beachSlug));
    };

    syncFavorite();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === FAVORITES_STORAGE_KEY || event.key === null) syncFavorite();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [beachSlug]);

  function toggleFavorite() {
    const current = new Set(readFavoriteSlugs());
    if (current.has(beachSlug)) {
      current.delete(beachSlug);
    } else {
      current.add(beachSlug);
    }

    const next = [...current].sort();
    writeFavoriteSlugs(next);
    setIsFavorite(next.includes(beachSlug));
  }

  return (
    <button
      type="button"
      aria-label={isFavorite ? `Rimuovi ${beachName} dai preferiti` : `Salva ${beachName}`}
      aria-pressed={isFavorite}
      onClick={toggleFavorite}
      className={`detail-press grid size-11 place-items-center rounded-full bg-white/88 text-[var(--ink)] shadow-[0_6px_17px_rgba(8,47,61,0.13)] backdrop-blur-md ${isFavorite ? "text-[var(--score-poor)]" : ""} ${className}`}
    >
      <Heart aria-hidden="true" size={19} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}
