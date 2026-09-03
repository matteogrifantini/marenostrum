"use client";

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
        <article className="detail-surface detail-enter flex min-h-16 items-center justify-between gap-4 p-4 sm:p-5">
          {isVerifiedGoogleProfile && reviewProfile ? (
            <a
              href={reviewProfile.mapsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Apri recensioni Google"
              className="inline-flex min-h-11 items-center rounded-full px-2 text-[var(--sun-dark)] transition-transform hover:scale-105 active:scale-95"
            >
              <span role="img" aria-label="Recensioni Google" className="text-lg tracking-[0.12em]">★★★★★</span>
            </a>
          ) : (
            <p className="text-sm leading-6 text-[var(--muted)]">Nessuna recensione disponibile.</p>
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
