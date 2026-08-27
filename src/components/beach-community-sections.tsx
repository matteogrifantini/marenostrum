"use client";

import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { BeachDetailContent, BeachReview } from "../domain/beach-detail-content";
import { createClient as createSupabaseBrowserClient } from "../lib/supabase/client";
import { versionedMediaUrl } from "../lib/media-url";
import { BeachPhotoViewer } from "./beach-photo-viewer";

type BeachCommunitySectionsProps = {
  detail: BeachDetailContent;
  beachSlug?: string;
  beachName?: string;
};

export function BeachCommunitySections({ detail, beachSlug, beachName = "questa spiaggia" }: BeachCommunitySectionsProps) {
  const { reviewProfile, webcam } = detail;
  const [reviews, setReviews] = useState(detail.reviews);
  const [selectedPhoto, setSelectedPhoto] = useState<BeachDetailContent["recentPhotos"][number] | null>(null);

  const handleReviewSaved = (review: SavedReview) => {
    setReviews((current) => mergeSavedReview(current, review));
  };

  return (
    <>
      <section aria-label="Recensioni">
        <SectionHeading title="Recensioni" />
        <article className="detail-surface detail-enter p-4 sm:p-5">
          {reviews ? (
            <>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Recensioni della community</p>
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
          ) : (
            <p className="text-sm leading-6 text-[var(--muted)]">Nessuna recensione locale disponibile.</p>
          )}

          {reviewProfile ? (
            <div className="mt-4 border-t border-[var(--line)] pt-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Recensioni Google</p>
              <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                {reviewProfile.verificationStatus === "draft"
                  ? "Profilo Google da confermare."
                  : "Leggi le recensioni e il punteggio direttamente su Google Maps."}
              </p>
              <a
                href={reviewProfile.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center rounded-[0.85rem] bg-[var(--ink)] px-3 text-xs font-extrabold text-white transition-[transform,background-color] hover:bg-[var(--sea-deep)] active:scale-[0.98]"
              >
                {reviewProfile.verificationStatus === "draft"
                  ? "Cerca su Google Maps"
                  : reviewProfile.provider.toLowerCase() === "google"
                    ? "Apri recensioni Google"
                    : "Apri recensioni"}
              </a>
            </div>
          ) : null}

          {beachSlug ? <InternalReviewForm beachSlug={beachSlug} onSaved={handleReviewSaved} /> : null}
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
                onClick={() => setSelectedPhoto(photo)}
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

      {webcam ? (
        <section aria-label="Webcam più vicina">
          <SectionHeading title="Webcam più vicina" />
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
        </section>
      ) : null}

      {selectedPhoto ? (
        <BeachPhotoViewer
          beachName={beachName}
          imageSrc={versionedMediaUrl(selectedPhoto.src)}
          imageAlt={selectedPhoto.alt}
          onClose={() => setSelectedPhoto(null)}
        />
      ) : null}
    </>
  );
}

type SavedReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
};

function mergeSavedReview(current: BeachDetailContent["reviews"], saved: SavedReview) {
  const existing = current?.items.filter((item) => item.rating !== undefined) ?? [];
  const items: BeachReview[] = [
    { id: saved.id, author: saved.author, age: "adesso", text: saved.text, rating: saved.rating },
    ...existing.filter((item) => item.id !== saved.id),
  ];
  const rating = Math.round((items.reduce((sum, item) => sum + (item.rating ?? 0), 0) / items.length) * 10) / 10;
  const recommendedPercent = Math.round((items.filter((item) => (item.rating ?? 0) >= 4).length / items.length) * 100);

  return { rating, recommendedPercent, total: items.length, items };
}

function InternalReviewForm({ beachSlug, onSaved }: { beachSlug: string; onSaved: (review: SavedReview) => void }) {
  const [authState, setAuthState] = useState<"signed-in" | "signed-out">("signed-out");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const client = createSupabaseBrowserClient();
    if (!client) return;

    void client.auth.getUser()
      .then(({ data }: { data: { user: User | null } }) => setAuthState(data.user ? "signed-in" : "signed-out"))
      .catch(() => setAuthState("signed-out"));
  }, []);

  if (authState !== "signed-in") {
    return (
      <div className="mt-4 border-t border-[var(--line)] pt-4">
        <p className="text-sm font-bold text-[var(--ink)]">Hai provato questa spiaggia?</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Accedi per lasciare una valutazione.</p>
        <a
          href="/impostazioni"
          className="mt-3 inline-flex min-h-11 items-center rounded-[0.85rem] bg-[var(--surface-muted)] px-3 text-xs font-extrabold text-[var(--ink)] transition-[transform,background-color] hover:bg-[var(--sand-muted)] active:scale-[0.98]"
        >
          Accedi per recensire
        </a>
      </div>
    );
  }

  async function submitReview() {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: beachSlug, rating, body }),
      });
      const payload: unknown = await response.json();
      const review = payload && typeof payload === "object" && "review" in payload
        ? (payload as { review?: SavedReview }).review
        : undefined;

      if (!response.ok || !review) {
        const message = payload && typeof payload === "object" && "error" in payload
          ? String((payload as { error?: unknown }).error ?? "Impossibile salvare")
          : "Impossibile salvare";
        throw new Error(message);
      }

      onSaved(review);
      setBody("");
      setStatus("idle");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Impossibile salvare");
      setStatus("error");
    }
  }

  return (
    <div className="mt-4 border-t border-[var(--line)] pt-4">
      <p className="text-sm font-bold text-[var(--ink)]">La tua valutazione</p>
      <div role="group" aria-label="Scegli il voto da 1 a 5 stelle" className="mt-2 flex gap-1">
        {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} stelle`}
            aria-pressed={rating === value}
            onClick={() => setRating(value)}
            className={`grid size-9 place-items-center rounded-full text-lg transition-[transform,background-color,color] active:scale-95 ${rating >= value ? "bg-[var(--sun-soft)] text-[var(--sun-dark)]" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}
          >
            ★
          </button>
        ))}
      </div>
      <label htmlFor={`review-body-${beachSlug}`} className="sr-only">Commento (facoltativo)</label>
      <textarea
        id={`review-body-${beachSlug}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={500}
        placeholder="Un commento breve (facoltativo)"
        className="mt-3 min-h-20 w-full resize-y rounded-[0.85rem] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--sun)] focus:ring-2 focus:ring-[rgba(255,194,71,0.2)]"
      />
      <button
        type="button"
        onClick={submitReview}
        disabled={status === "submitting"}
        className="mt-3 inline-flex min-h-11 items-center rounded-[0.85rem] bg-[var(--sun)] px-4 text-xs font-black text-[var(--ink)] transition-[transform,opacity] hover:opacity-90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Salvo…" : "Pubblica valutazione"}
      </button>
      {status === "error" ? <p role="alert" className="mt-2 text-xs font-bold text-[var(--coral)]">{errorMessage}</p> : null}
    </div>
  );
}

function SectionHeading({ title, meta }: { title: string; meta?: string }) {
  return <div className="mx-1 mb-2 mt-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2>{meta ? <span className="text-xs font-bold text-[var(--sea)]">{meta}</span> : null}</div>;
}
