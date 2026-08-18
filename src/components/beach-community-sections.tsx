"use client";

import Image from "next/image";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { BeachDetailContent } from "../data/demo-beach-details";

type BeachCommunitySectionsProps = {
  detail: BeachDetailContent;
};

export function BeachCommunitySections({ detail }: BeachCommunitySectionsProps) {
  const [vote, setVote] = useState<"like" | "dislike" | null>(null);

  return (
    <>
      <section aria-label="Recensioni">
        <SectionHeading title="Recensioni" meta="mostra tutte" />
        <article className="detail-surface detail-enter p-4 sm:p-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-extrabold tracking-[-0.035em]">Recensioni</h2>
            <div className="text-right">
              <strong className="text-3xl tracking-[-0.05em]">{detail.reviews.rating.toFixed(1)}</strong>
              <span aria-label={`${detail.reviews.rating.toFixed(1)} stelle su 5`} className="block text-xs tracking-[0.08em] text-[var(--sun-dark)]">★★★★★</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--ink-soft)]">👍 {detail.reviews.recommendedPercent}% la consiglia</span>
            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--ink-soft)]">{detail.reviews.total} recensioni</span>
          </div>
          {detail.reviews.items.slice(0, 2).map((review) => (
            <figure key={review.id} className="mt-4 border-t border-[var(--line)] pt-4">
              <blockquote className="text-sm leading-6 text-[var(--ink-soft)]">“{review.text}”</blockquote>
              <figcaption className="mt-2 text-xs font-semibold text-[var(--muted)]">{review.author} · {review.age}</figcaption>
            </figure>
          ))}
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <p className="text-sm font-bold">Questa spiaggia fa per te?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" aria-pressed={vote === "like"} onClick={() => setVote("like")} className={`detail-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.85rem] text-sm font-extrabold ${vote === "like" ? "bg-[var(--sea)] text-white" : "bg-[var(--surface-muted)] text-[var(--ink)]"}`}>
                <ThumbsUp aria-hidden="true" size={16} /> Mi piace
              </button>
              <button type="button" aria-pressed={vote === "dislike"} onClick={() => setVote("dislike")} className={`detail-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.85rem] text-sm font-extrabold ${vote === "dislike" ? "bg-[var(--ink)] text-white" : "bg-[var(--surface-muted)] text-[var(--ink)]"}`}>
                <ThumbsDown aria-hidden="true" size={16} /> Non mi piace
              </button>
            </div>
          </div>
        </article>
      </section>

      <section aria-label="Foto aggiunte di recente">
        <SectionHeading title="Foto aggiunte di recente" meta="vedi tutte" />
        <div className="detail-photo-rail detail-enter grid auto-cols-[44%] grid-flow-col gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {detail.recentPhotos.map((photo) => (
            <figure key={photo.id} className="relative h-36 snap-start overflow-hidden rounded-[1.1rem] bg-[var(--surface-muted)] shadow-[0_7px_18px_rgba(8,47,61,0.08)]">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 44vw, 330px" className="object-cover" />
              <figcaption className="absolute bottom-2 left-2 rounded-full bg-[rgba(7,44,53,0.52)] px-2 py-1 text-[0.65rem] font-bold text-white backdrop-blur-md">{photo.age}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section aria-label="Webcam più vicina">
        <SectionHeading title="Webcam più vicina" meta={`${detail.webcam.distanceKm.toFixed(1)} km`} />
        <article className="detail-surface detail-enter relative h-40 overflow-hidden text-white">
          <Image src={detail.webcam.image} alt={detail.webcam.alt} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(5,55,61,0.92)] via-[rgba(5,55,61,0.62)] to-[rgba(5,55,61,0.18)]" />
          <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 text-[0.65rem] font-black backdrop-blur-md"><span aria-hidden="true" className={`size-2 rounded-full ${detail.webcam.live ? "bg-[#ff7466]" : "bg-white/55"}`} /> {detail.webcam.live ? "WEBCAM LIVE" : "WEBCAM"}</span>
            <strong className="text-xl">{detail.webcam.name}</strong>
            <p className="mt-1 text-xs text-white/75">{detail.webcam.updated}</p>
          </div>
        </article>
      </section>
    </>
  );
}

function SectionHeading({ title, meta }: { title: string; meta: string }) {
  return <div className="mx-1 mb-2 mt-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2><span className="text-xs font-bold text-[var(--sea)]">{meta}</span></div>;
}
