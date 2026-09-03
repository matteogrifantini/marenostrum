"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import type { BeachWebcam } from "../domain/beach";

type WebcamEmbedProps = {
  webcam: BeachWebcam;
  beachName: string;
};

export function WebcamEmbed({ webcam, beachName }: WebcamEmbedProps) {
  const [failedPosterUrl, setFailedPosterUrl] = useState<string | null>(null);
  const webcamTitle = webcam.title || beachName;
  const isVerifiedLive = webcam.verifiedLive === true;
  const posterFailed = webcam.posterUrl != null && failedPosterUrl === webcam.posterUrl;

  return (
    <section
      aria-labelledby="webcam-heading"
      className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_12px_36px_rgba(20,44,57,0.06)] sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5">
        <div className="flex items-center gap-2">
          {webcam.verifiedLive === true ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wider text-white shadow-sm">
              <span className="size-2 animate-ping rounded-full bg-white" />
              LIVE
            </span>
          ) : null}
          <h2
            id="webcam-heading"
            className="font-serif text-base font-bold tracking-[-0.02em] text-[var(--ink)] sm:text-lg"
          >
            {isVerifiedLive ? `Webcam in diretta · ${webcamTitle}` : `Webcam · ${webcamTitle}`}
          </h2>
        </div>
      </div>

      <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 shadow-inner">
        {webcam.posterUrl && !posterFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={webcam.posterUrl}
            alt={isVerifiedLive ? `Anteprima webcam in diretta per ${webcamTitle}` : `Anteprima webcam per ${webcamTitle}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setFailedPosterUrl(webcam.posterUrl ?? null)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-4 text-center text-sm font-semibold text-white/88">
            Anteprima non disponibile
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

        {/* Provider action overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
          {webcam.liveUrl && (
            <a
              href={webcam.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-press flex items-center gap-3 rounded-full border border-white/40 bg-black/50 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-[background-color,transform] duration-200 hover:bg-black/70 hover:scale-105 active:scale-95"
            >
              {isVerifiedLive ? (
                <>
                  <span className="grid size-9 place-items-center rounded-full bg-red-600 text-white shadow-sm">
                    <Play aria-hidden="true" size={16} fill="currentColor" className="ml-0.5" />
                  </span>
                  <span>Guarda lo streaming in diretta</span>
                </>
              ) : (
                <>
                  <span className="grid size-9 place-items-center rounded-full bg-white/15 text-white shadow-sm">
                    <ExternalLink aria-hidden="true" size={16} />
                  </span>
                  <span>Apri la pagina del provider</span>
                </>
              )}
            </a>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)] p-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[var(--ink)]">{webcamTitle}</p>
          {isVerifiedLive ? (
            <p className="text-[0.68rem] text-[var(--muted)]">
              Streaming in tempo reale {webcam.provider ? `· ${webcam.provider}` : ""}
            </p>
          ) : (
            <p className="text-[0.68rem] text-[var(--muted)]">
              Fonte esterna; verifica la disponibilità sul sito del provider
            </p>
          )}
        </div>
        {webcam.liveUrl && (
          <a
            href={webcam.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-press inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 text-xs font-extrabold text-white shadow-sm transition-transform hover:bg-[var(--sea-deep)] active:scale-95"
          >
            <span>Apri la pagina del provider</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}
