"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Info, MapPin, Play, Share2 } from "lucide-react";
import { useState } from "react";
import type { Beach, BeachPeriod } from "../domain/beach";
import type { BeachDetailContent } from "../domain/beach-detail-content";
import { versionedMediaUrl } from "../lib/media-url";
import { BeachPhotoViewer } from "./beach-photo-viewer";
import { BeachVideoReel } from "./beach-video-reel";
import { FavoriteToggle } from "./favorite-toggle";

type DetailHeroProps = {
  beach: Beach;
  detail: BeachDetailContent;
  period?: BeachPeriod;
  homeDate?: string;
  distanceKm?: number;
  infoOpen?: boolean;
  onInfoToggle?: () => void;
};

export function DetailHero({ beach, detail, homeDate, distanceKm, infoOpen = false, onInfoToggle }: DetailHeroProps) {
  const [shared, setShared] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showReels, setShowReels] = useState(false);
  const image = beach.image;
  const imageSrc = image ? versionedMediaUrl(image) : undefined;
  const imageAlt = beach.imageAlt ?? `Foto di ${beach.name}`;
  const backHref = homeDate
    ? `/?date=${encodeURIComponent(homeDate)}&period=all-day#classifica`
    : "/?period=all-day#classifica";

  const handleShare = () => {
    void (async () => {
      const url = window.location.href;

      try {
        if (navigator.share) {
          await navigator.share({
            title: `Meteo Mare ${beach.name} (${beach.municipality}) — Mare Nostrum`,
            text: `Guarda le condizioni del mare e del vento oggi a ${beach.name} (${beach.municipality}) su Mare Nostrum.`,
            url,
          });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
        }
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setShared(false);
      }
    })();
  };

  return (
    <>
      <section className="relative min-h-[20rem] overflow-hidden rounded-[1.8rem] bg-[var(--ink)] text-white shadow-[0_20px_60px_rgba(20,44,57,0.16)] sm:min-h-[26rem]">
        {imageSrc ? (
          <button
            type="button"
            aria-label={`Apri foto di ${beach.name}`}
            onClick={() => setShowPhoto(true)}
            className="absolute inset-0 z-0 h-full w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
          >
            <Image src={imageSrc} alt={imageAlt} fill loading="eager" sizes="(max-width: 639px) 100vw, (max-width: 1440px) calc(100vw - 3rem), 1440px" className="object-cover" />
          </button>
        ) : (
          <div
            role="img"
            aria-label={`Foto non disponibile per ${beach.name}`}
            className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_32%),linear-gradient(145deg,var(--sea-deep),var(--ink))]"
          >
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 opacity-25 [background:linear-gradient(155deg,transparent_48%,rgba(255,255,255,0.24)_49%,transparent_51%)] [background-size:3rem_3rem]" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[rgba(6,28,35,0.82)]" />

        <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between gap-3">
          <Link href={backHref} aria-label="Torna alle spiagge" className="detail-press grid size-11 place-items-center rounded-full bg-white/88 text-[var(--ink)] shadow-[0_6px_17px_rgba(8,47,61,0.13)] backdrop-blur-md">
            <ArrowLeft aria-hidden="true" size={19} />
          </Link>
          <div className="flex items-center gap-2">
            <FavoriteToggle beachSlug={beach.slug} beachName={beach.name} />
            <button type="button" aria-label={shared ? "Link copiato" : "Condividi spiaggia"} onClick={handleShare} className="detail-press grid size-11 place-items-center rounded-full bg-white/88 text-[var(--ink)] shadow-[0_6px_17px_rgba(8,47,61,0.13)] backdrop-blur-md">
              {shared ? <Check aria-hidden="true" size={19} /> : <Share2 aria-hidden="true" size={19} />}
            </button>
          </div>
        </div>

        {detail.reels.length > 0 ? (
          <button type="button" onClick={() => setShowReels(true)} aria-label={`Guarda i video · ${detail.reels.length}`} className="detail-press absolute left-1/2 top-[42%] z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/40 bg-black/28 py-1.5 pl-1.5 pr-3 text-xs font-bold text-white backdrop-blur-md">
            <span className="grid size-8 place-items-center rounded-full bg-white text-[var(--ink)]"><Play aria-hidden="true" size={15} fill="currentColor" /></span>
            Guarda i video · {detail.reels.length}
          </button>
        ) : null}

        <div className="absolute inset-x-5 bottom-5 z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white/78">
            <MapPin aria-hidden="true" size={14} />
            <span>{beach.municipality}</span>
            {distanceKm === undefined ? null : <><span aria-hidden="true">·</span><span>{distanceKm} km da te</span></>}
          </div>
          <h1 className="mt-2 max-w-[32rem] font-serif text-[clamp(2.7rem,11vw,4.8rem)] font-semibold leading-[0.86] tracking-[-0.07em]">{beach.name}</h1>
          {onInfoToggle ? (
            <button
              type="button"
              aria-label="Scopri la spiaggia"
              aria-expanded={infoOpen}
              aria-controls="beach-info-accordion"
              onClick={onInfoToggle}
              className="detail-press mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/35 bg-white/15 px-4 text-sm font-bold text-white shadow-[0_8px_22px_rgba(6,28,35,0.18)] backdrop-blur-md transition-[background-color,border-color,transform] duration-200 ease-out hover:border-white/55 hover:bg-white/25 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Info aria-hidden="true" size={16} />
              <span>Scopri la spiaggia</span>
            </button>
          ) : null}
        </div>
      </section>

      {showPhoto && imageSrc ? <BeachPhotoViewer beachName={beach.name} imageSrc={imageSrc} imageAlt={imageAlt} onClose={() => setShowPhoto(false)} /> : null}
      {showReels && detail.reels.length > 0 ? <BeachVideoReel beachName={beach.name} reels={detail.reels} onClose={() => setShowReels(false)} /> : null}
    </>
  );
}
