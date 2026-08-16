"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Heart, MapPin, Share2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { BeachPeriod, BeachRecommendation } from "../domain/beach";
import { BeachScore } from "./beach-score";

type DetailHeroProps = {
  recommendation: BeachRecommendation;
  date: string;
  period: BeachPeriod;
};

export function DetailHero({ recommendation, date, period }: DetailHeroProps) {
  const { beach, conditions } = recommendation;
  const [favorite, setFavorite] = useState(false);
  const [shared, setShared] = useState(false);
  const [reported, setReported] = useState(false);
  const image = beach.image ?? "/images/beaches/cala-del-gelsomino.jpg";
  const imageAlt = beach.imageAlt ?? `Foto di ${beach.name}`;
  const backHref = `/?date=${encodeURIComponent(date)}&period=${period}#classifica`;
  const mapsHref =
    beach.latitude && beach.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${beach.latitude},${beach.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(beach.name)}`;

  const handleShare = () => {
    void (async () => {
      const url = window.location.href;

      try {
        if (navigator.share) {
          await navigator.share({ title: beach.name, text: beach.description, url });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
        }
        setShared(true);
      } catch {
        setShared(false);
      }
    })();
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[var(--ink)] text-white shadow-[0_24px_80px_rgba(20,44,57,0.18)]">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,28,35,0.92)] via-[rgba(10,28,35,0.32)] to-[rgba(10,28,35,0.16)]" />
      <div className="relative flex min-h-[520px] flex-col justify-between p-4 sm:min-h-[610px] sm:p-7 lg:p-10">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black/25 px-4 text-sm font-bold text-white backdrop-blur-md transition-[transform,background-color] duration-200 ease-out hover:bg-black/40 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Torna alle spiagge
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={shared ? "Link copiato" : "Condividi spiaggia"}
              onClick={handleShare}
              className="grid size-11 place-items-center rounded-full bg-black/25 text-white backdrop-blur-md transition-[transform,background-color] duration-200 ease-out hover:bg-black/40 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
            >
              {shared ? <Check aria-hidden="true" size={18} /> : <Share2 aria-hidden="true" size={18} />}
            </button>
            <button
              type="button"
              aria-label={favorite ? `Rimuovi ${beach.name} dai preferiti` : `Salva ${beach.name}`}
              aria-pressed={favorite}
              onClick={() => setFavorite((current) => !current)}
              className="grid size-11 place-items-center rounded-full bg-black/25 text-white backdrop-blur-md transition-[transform,background-color] duration-200 ease-out hover:bg-black/40 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
            >
              <Heart aria-hidden="true" size={18} fill={favorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden="true" size={15} />
              {beach.municipality} · {beach.coast}
            </span>
          </div>
          <h1 className="font-serif text-[clamp(3.2rem,8vw,7rem)] font-semibold leading-[0.84] tracking-[-0.075em]">
            {beach.name}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
            {beach.description}
          </p>
          <div className="mt-7 flex flex-wrap items-end gap-4">
            <div className="rounded-[1.25rem] bg-white/92 px-4 py-3 text-[var(--ink)] shadow-[0_12px_35px_rgba(10,28,35,0.16)] backdrop-blur-md">
              <BeachScore score={recommendation.score} label={recommendation.label} />
            </div>
            <div className="rounded-[1.25rem] bg-black/25 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md">
              <span className="block text-xs font-bold uppercase tracking-[0.13em] text-white/60">Meteo</span>
              <span className="mt-1 block">{conditions.weather}</span>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink)] transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sun)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
            >
              Apri in Maps
            </a>
            <button
              type="button"
              onClick={() => setReported(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black/25 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-[transform,background-color] duration-200 ease-out hover:bg-black/40 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
            >
              {reported ? <Check aria-hidden="true" size={15} /> : <TriangleAlert aria-hidden="true" size={15} />}
              {reported ? "Segnalazione ricevuta" : "Segnala un dato"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
