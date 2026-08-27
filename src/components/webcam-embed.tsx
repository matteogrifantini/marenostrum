"use client";

import { ExternalLink, Tv } from "lucide-react";
import { useState } from "react";
import type { BeachWebcam } from "../domain/beach";

type WebcamEmbedProps = {
  webcam: BeachWebcam;
  beachName: string;
};

export function WebcamEmbed({ webcam, beachName }: WebcamEmbedProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <section
      aria-labelledby="webcam-heading"
      className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_12px_36px_rgba(20,44,57,0.06)] sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wider text-white shadow-sm">
            <span className="size-2 animate-ping rounded-full bg-white" />
            LIVE
          </span>
          <h2
            id="webcam-heading"
            className="font-serif text-base font-bold tracking-[-0.02em] text-[var(--ink)] sm:text-lg"
          >
            Webcam in diretta · {webcam.title || beachName}
          </h2>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 shadow-inner">
        {!hasError ? (
          <iframe
            src={webcam.embedUrl}
            title={`Webcam in diretta da ${beachName}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setHasError(true)}
            className="h-full w-full border-0"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center text-white">
            <div className="space-y-2">
              <Tv aria-hidden="true" size={32} className="mx-auto text-white/50" />
              <p className="text-sm font-semibold">Streaming video live disponibile sul canale ufficiale.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)] p-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[var(--ink)]">{webcam.title || beachName}</p>
          <p className="text-[0.68rem] text-[var(--muted)]">
            Streaming in tempo reale {webcam.provider ? `· ${webcam.provider}` : ""}
          </p>
        </div>
        {webcam.liveUrl && (
          <a
            href={webcam.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-press inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 text-xs font-extrabold text-white shadow-sm transition-transform hover:bg-[var(--sea-deep)] active:scale-95"
          >
            <span>Apri diretta live</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}
