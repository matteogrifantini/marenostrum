"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, Play, Share2 } from "lucide-react";
import { useState } from "react";
import type { Beach, BeachPeriod } from "../domain/beach";
import type { BeachDetailContent } from "../domain/beach-detail-content";
import { versionedMediaUrl } from "../lib/media-url";
import { BeachVideoReel } from "./beach-video-reel";
import { FavoriteToggle } from "./favorite-toggle";

type DetailHeroProps = {
  beach: Beach;
  detail: BeachDetailContent;
  period?: BeachPeriod;
  homeDate?: string;
  distanceKm?: number;
};

export function DetailHero({ beach, detail, homeDate, distanceKm }: DetailHeroProps) {
  const [shared, setShared] = useState(false);
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
    <>
      <section className="relative min-h-[20rem] overflow-hidden rounded-[1.8rem] bg-[var(--ink)] text-white shadow-[0_20px_60px_rgba(20,44,57,0.16)] sm:min-h-[26rem]">
        {imageSrc ? (
          <Image src={imageSrc} alt={imageAlt} fill loading="eager" sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        ) : (
          <div
            role="img"
            aria-label={`Foto non disponibile per ${beach.name}`}
            className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_32%),linear-gradient(145deg,var(--sea-deep),var(--ink))]"
          >
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 opacity-25 [background:linear-gradient(155deg,transparent_48%,rgba(255,255,255,0.24)_49%,transparent_51%)] [background-size:3rem_3rem]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[rgba(6,28,35,0.82)]" />

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
        </div>
      </section>

      {showReels && detail.reels.length > 0 ? <BeachVideoReel beachName={beach.name} reels={detail.reels} onClose={() => setShowReels(false)} /> : null}
    </>
  );
}
