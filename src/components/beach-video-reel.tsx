"use client";

import Image from "next/image";
import { Heart, Play, Send, X } from "lucide-react";
import { useEffect } from "react";
import type { BeachReel } from "../domain/beach-detail-content";

type BeachVideoReelProps = {
  beachName: string;
  reels: BeachReel[];
  onClose: () => void;
};

export function BeachVideoReel({ beachName, reels, onClose }: BeachVideoReelProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Video della spiaggia"
      className="detail-reel-dialog fixed inset-0 z-[100] bg-[#061a20] text-white"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/55 to-transparent px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi video"
          className="detail-press pointer-events-auto grid size-11 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md"
        >
          <X aria-hidden="true" size={20} />
        </button>
        <strong className="text-sm">{beachName}</strong>
        <span aria-hidden="true" className="size-11" />
      </div>

      <div className="h-dvh snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {reels.map((reel, index) => (
          <article key={reel.id} className="relative h-dvh snap-start snap-always overflow-hidden bg-[#173e49]">
            <Image src={reel.src} alt={reel.alt} fill sizes="100vw" className="object-cover" loading={index === 0 ? "eager" : "lazy"} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/80" />
            <span className="absolute right-4 top-20 z-10 rounded-full bg-black/30 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
              {index + 1} / {reels.length}
            </span>
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/25 backdrop-blur-md">
              <Play size={27} fill="currentColor" />
            </span>
            <div className="absolute bottom-28 right-4 z-10 grid gap-4 text-center text-[0.65rem] font-bold">
              <span className="grid gap-1"><span className="grid size-11 place-items-center rounded-full bg-black/35 backdrop-blur-md"><Heart size={19} /></span>Salva</span>
              <span className="grid gap-1"><span className="grid size-11 place-items-center rounded-full bg-black/35 backdrop-blur-md"><Send size={18} /></span>Invia</span>
            </div>
            <div className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 right-20 z-10">
              <strong className="text-sm">{reel.author}</strong>
              <p className="mt-2 text-sm leading-5 text-white/78">{reel.caption}</p>
              {index < reels.length - 1 ? (
                <span className="mt-3 inline-block text-xs font-semibold text-white/60">↑ Scorri per il prossimo video</span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
