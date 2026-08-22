"use client";

import Image from "next/image";
import type { BeachDetailContent } from "../domain/beach-detail-content";
import { versionedMediaUrl } from "../lib/media-url";

type BeachCommunitySectionsProps = {
  detail: BeachDetailContent;
};

export function BeachCommunitySections({ detail }: BeachCommunitySectionsProps) {
  const { reviews, reviewProfile, webcam } = detail;

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
                <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--ink-soft)]"><span aria-hidden="true" className="emoji-readable-mobile">👍</span> {reviews.recommendedPercent}% la consiglia</span>
                <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--ink-soft)]">{reviews.total} recensioni</span>
              </div>
              {reviews.items.slice(0, 2).map((review) => (
                <figure key={review.id} className="mt-4 border-t border-[var(--line)] pt-4">
                  <blockquote className="text-sm leading-6 text-[var(--ink-soft)]">“{review.text}”</blockquote>
                  <figcaption className="mt-2 text-xs font-semibold text-[var(--muted)]">{review.author} · {review.age}</figcaption>
                </figure>
              ))}
            </>
          ) : reviewProfile ? (
            <div>
              <p className="text-sm leading-6 text-[var(--muted)]">
                {reviewProfile.verificationStatus === "draft"
                  ? "Profilo Google da confermare."
                  : "Nessuna recensione locale disponibile."}
              </p>
              <a
                href={reviewProfile.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center rounded-[0.85rem] bg-[var(--sea-soft)] px-3 text-xs font-extrabold text-[var(--sea-deep)]"
              >
                {reviewProfile.verificationStatus === "draft"
                  ? "Cerca su Google Maps"
                  : reviewProfile.provider.toLowerCase() === "google"
                    ? "Apri recensioni Google"
                    : "Apri recensioni"}
              </a>
            </div>
          ) : (
            <p className="text-sm leading-6 text-[var(--muted)]">Nessuna recensione locale disponibile.</p>
          )}
        </article>
      </section>

      <section aria-label="Foto aggiunte di recente">
        <SectionHeading title="Foto aggiunte di recente" meta="vedi tutte" />
        <div className="detail-photo-rail detail-enter grid auto-cols-[44%] grid-flow-col gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {detail.recentPhotos.map((photo) => (
            <figure key={photo.id} className="relative h-36 snap-start overflow-hidden rounded-[1.1rem] bg-[var(--surface-muted)] shadow-[0_7px_18px_rgba(8,47,61,0.08)]">
              <Image src={versionedMediaUrl(photo.src)} alt={photo.alt} fill sizes="(max-width: 768px) 44vw, 330px" className="object-cover" />
              <figcaption className="absolute bottom-2 left-2 rounded-full bg-[rgba(7,44,53,0.52)] px-2 py-1 text-[0.65rem] font-bold text-white backdrop-blur-md">{photo.age}</figcaption>
            </figure>
          ))}
          {detail.recentPhotos.length === 0 ? <p className="text-sm text-[var(--muted)]">Nessuna foto recente disponibile.</p> : null}
        </div>
      </section>

      <section aria-label="Webcam più vicina">
        <SectionHeading title="Webcam più vicina" />
        {webcam ? (
          <article className="detail-surface detail-enter relative h-40 overflow-hidden text-white">
            {webcam.image ? (
              <Image src={webcam.image} alt={webcam.alt ?? `Anteprima della webcam di ${webcam.name}`} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            ) : (
              <div role="img" aria-label={`Anteprima non disponibile per ${webcam.name}`} className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.16),transparent_25%),linear-gradient(135deg,var(--sea-deep),var(--ink))]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(5,55,61,0.92)] via-[rgba(5,55,61,0.62)] to-[rgba(5,55,61,0.18)]" />
            <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 text-[0.65rem] font-black backdrop-blur-md"><span aria-hidden="true" className={`size-2 rounded-full ${webcam.live ? "bg-[#ff7466]" : "bg-white/55"}`} /> {webcam.live ? "WEBCAM LIVE" : "WEBCAM"}</span>
              <div className="flex items-center justify-between gap-3">
                <strong className="text-xl">{webcam.name}</strong>
                {webcam.distanceKm === undefined ? null : <span className="shrink-0 text-xs font-bold text-white/80">{webcam.distanceKm.toFixed(1)} km</span>}
              </div>
              <p className="mt-1 text-xs text-white/75">{webcam.updated}</p>
              {webcam.pageUrl ? <a href={webcam.pageUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-10 w-fit items-center rounded-full bg-white/15 px-3 text-xs font-extrabold backdrop-blur-md">Apri webcam</a> : null}
            </div>
          </article>
        ) : <p className="detail-surface detail-enter p-4 text-sm text-[var(--muted)]">Nessuna webcam disponibile.</p>}
      </section>
    </>
  );
}

function SectionHeading({ title, meta }: { title: string; meta?: string }) {
  return <div className="mx-1 mb-2 mt-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2>{meta ? <span className="text-xs font-bold text-[var(--sea)]">{meta}</span> : null}</div>;
}
