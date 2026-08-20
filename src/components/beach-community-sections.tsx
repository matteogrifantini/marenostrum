"use client";

import Image from "next/image";
import type { BeachDetailContent } from "../data/demo-beach-details";

type BeachCommunitySectionsProps = {
  detail: BeachDetailContent;
};

export function BeachCommunitySections({ detail }: BeachCommunitySectionsProps) {
  const { reviews, webcam } = detail;

  return (
    <>
      <section aria-label="Recensioni">
        <SectionHeading title="Recensioni" meta={reviews ? "mostra tutte" : ""} />
        <article className="detail-surface detail-enter p-4 sm:p-5">
          {reviews ? (
            <>
              <div className="flex justify-end">
                <div className="text-right">
                  <strong className="text-3xl tracking-[-0.05em]">{reviews.rating.toFixed(1)}</strong>
                  <span aria-label={`${reviews.rating.toFixed(1)} stelle su 5`} className="block text-xs tracking-[0.08em] text-[var(--sun-dark)]">★★★★★</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--ink-soft)]">👍 {reviews.recommendedPercent}% la consiglia</span>
                <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--ink-soft)]">{reviews.total} recensioni</span>
              </div>
              {reviews.items.slice(0, 2).map((review) => (
                <figure key={review.id} className="mt-4 border-t border-[var(--line)] pt-4">
                  <blockquote className="text-sm leading-6 text-[var(--ink-soft)]">“{review.text}”</blockquote>
                  <figcaption className="mt-2 text-xs font-semibold text-[var(--muted)]">{review.author} · {review.age}</figcaption>
                </figure>
              ))}
            </>
          ) : (
            <p className="text-sm leading-6 text-[var(--muted)]">Nessuna recensione disponibile per questa spiaggia.</p>
          )}
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
          {detail.recentPhotos.length === 0 ? <p className="text-sm text-[var(--muted)]">Nessuna foto recente disponibile.</p> : null}
        </div>
      </section>

      <section aria-label="Webcam più vicina">
        <SectionHeading title="Webcam più vicina" meta={webcam ? `${webcam.distanceKm.toFixed(1)} km` : ""} />
        {webcam ? (
          <article className="detail-surface detail-enter relative h-40 overflow-hidden text-white">
            <Image src={webcam.image} alt={webcam.alt} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(5,55,61,0.92)] via-[rgba(5,55,61,0.62)] to-[rgba(5,55,61,0.18)]" />
            <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 text-[0.65rem] font-black backdrop-blur-md"><span aria-hidden="true" className={`size-2 rounded-full ${webcam.live ? "bg-[#ff7466]" : "bg-white/55"}`} /> {webcam.live ? "WEBCAM LIVE" : "WEBCAM"}</span>
              <strong className="text-xl">{webcam.name}</strong>
              <p className="mt-1 text-xs text-white/75">{webcam.updated}</p>
            </div>
          </article>
        ) : <p className="detail-surface detail-enter p-4 text-sm text-[var(--muted)]">Nessuna webcam disponibile.</p>}
      </section>
    </>
  );
}

function SectionHeading({ title, meta }: { title: string; meta: string }) {
  return <div className="mx-1 mb-2 mt-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2>{meta ? <span className="text-xs font-bold text-[var(--sea)]">{meta}</span> : null}</div>;
}
