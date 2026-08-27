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

        {webcam.liveUrl && (
          <a
            href={webcam.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--sea-deep)] underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]"
          >
            <span>Apri sorgente</span>
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        )}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner">
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
              <p className="text-sm font-semibold">Streaming video momentaneamente non disponibile nel player.</p>
              {webcam.liveUrl && (
                <a
                  href={webcam.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30"
                >
                  <span>Guarda la webcam direttamente</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {webcam.provider && (
        <p className="mt-2 text-right text-[0.65rem] font-medium text-[var(--muted)]">
          Streaming fornito da {webcam.provider}
        </p>
      )}
    </section>
  );
}
