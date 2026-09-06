"use client";

import { ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { BeachDetailContent } from "../domain/beach-detail-content";
import { versionedMediaUrl } from "../lib/media-url";
import { BeachPhotoViewer } from "./beach-photo-viewer";

type BeachCommunitySectionsProps = {
  detail: BeachDetailContent;
  beachName?: string;
};

export function BeachCommunitySections({ detail, beachName = "questa spiaggia" }: BeachCommunitySectionsProps) {
  const { reviewProfile } = detail;
  const [selectedPhoto, setSelectedPhoto] = useState<BeachDetailContent["recentPhotos"][number] | null>(null);
  const isVerifiedGoogleProfile =
    reviewProfile?.provider.toLowerCase() === "google" && reviewProfile.verificationStatus === "verified";
  const ratingValue = reviewProfile?.rating;
  const hasRating = typeof ratingValue === "number" && ratingValue > 0;
  const formattedRating = hasRating ? ratingValue.toFixed(1) : null;
  const countValue = reviewProfile?.reviewCount;
  const formattedCount = typeof countValue === "number"
    ? new Intl.NumberFormat("it-IT", { useGrouping: true }).format(countValue)
    : null;

  const openPhoto = (photo: BeachDetailContent["recentPhotos"][number]) => {
    setSelectedPhoto(photo);
    if (typeof window !== "undefined") {
      window.history.pushState({ modal: "community-photo" }, "", window.location.href);
    }
  };

  const closePhoto = (fromHistory = false) => {
    setSelectedPhoto(null);
    if (!fromHistory && typeof window !== "undefined" && window.history.state?.modal === "community-photo") {
      window.history.back();
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (selectedPhoto) {
        setSelectedPhoto(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedPhoto]);

  return (
    <>
      <section aria-label="Recensioni">
        <SectionHeading title="Recensioni" />
        <article className="detail-surface detail-enter flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-[1.25rem]">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--sea-deep)] shadow-sm">
              <MapPin aria-hidden="true" size={20} />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">
                  Recensioni su Google Maps
                </h3>
                {isVerifiedGoogleProfile ? (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--sun-dark)]" aria-label="Valutazione verificata">
                    <span role="img" aria-hidden="true">★★★★★</span>
                  </span>
                ) : null}
              </div>
              {hasRating ? (
                <div className="flex flex-wrap items-baseline gap-2 pt-0.5" data-testid="google-review-rating">
                  <span className="text-xl font-black tracking-tight text-[var(--ink)]">
                    {formattedRating}
                  </span>
                  <span className="text-xs font-bold text-[var(--sun-dark)]" aria-label={`Valutazione: ${formattedRating} su 5`}>
                    ★★★★★
                  </span>
                  {formattedCount ? (
                    <span className="text-xs font-semibold text-[var(--muted)]">
                      ({formattedCount} {countValue === 1 ? "recensione" : "recensioni"})
                    </span>
                  ) : null}
                </div>
              ) : null}
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                {hasRating
                  ? `Valutazione complessiva dei visitatori su Google Maps per ${beachName}.`
                  : `Consulta valutazioni, foto e consigli recenti dei visitatori per ${beachName}.`}
              </p>
            </div>
          </div>
          {reviewProfile?.mapsUrl ? (
            <a
              href={reviewProfile.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Vedi recensioni di ${beachName} su Google Maps`}
              className="detail-press inline-flex h-10 shrink-0 items-center justify-center gap-1.5 self-start sm:self-auto rounded-full bg-[var(--sea-deep)] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--sea)] active:scale-95"
            >
              <span>Vedi su Google Maps</span>
              <ExternalLink aria-hidden="true" size={14} />
            </a>
          ) : (
            <p className="text-xs text-[var(--muted)]">Nessun profilo disponibile.</p>
          )}
        </article>
      </section>

      <section aria-label="Foto aggiunte di recente">
        <SectionHeading title="Foto aggiunte di recente" meta="vedi tutte" />
        <div className="detail-photo-rail detail-enter grid auto-cols-[44%] grid-flow-col gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {detail.recentPhotos.map((photo) => (
            <figure key={photo.id} className="relative h-36 snap-start overflow-hidden rounded-[1.1rem] bg-[var(--surface-muted)] shadow-[0_7px_18px_rgba(8,47,61,0.08)]">
              <button
                type="button"
                aria-label={`Apri foto di ${photo.alt}`}
                onClick={() => openPhoto(photo)}
                className="detail-press absolute inset-0 z-0 h-full w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
              >
                <span className="absolute inset-0">
                  <Image src={versionedMediaUrl(photo.src)} alt={photo.alt} fill sizes="(max-width: 768px) 44vw, 330px" className="object-cover" />
                </span>
              </button>
              <figcaption className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-full bg-[rgba(7,44,53,0.52)] px-2 py-1 text-[0.65rem] font-bold text-white backdrop-blur-md">{photo.age}</figcaption>
            </figure>
          ))}
          {detail.recentPhotos.length === 0 ? <p className="text-sm text-[var(--muted)]">Nessuna foto recente disponibile.</p> : null}
        </div>
      </section>

      {selectedPhoto ? (
        <BeachPhotoViewer
          beachName={beachName}
          imageSrc={versionedMediaUrl(selectedPhoto.src)}
          imageAlt={selectedPhoto.alt}
          onClose={() => closePhoto()}
        />
      ) : null}
    </>
  );
}

function SectionHeading({ title, meta }: { title: string; meta?: string }) {
  return <div className="mx-1 mb-2 mt-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2>{meta ? <span className="text-xs font-bold text-[var(--sea)]">{meta}</span> : null}</div>;
}
