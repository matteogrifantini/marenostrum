"use client";

import { ExternalLink, Play } from "lucide-react";
import type { BeachWebcam } from "../domain/beach";

type WebcamEmbedProps = {
  webcam: BeachWebcam;
  beachName: string;
};

export function WebcamEmbed({ webcam, beachName }: WebcamEmbedProps) {
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

      <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 shadow-inner">
        {webcam.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={webcam.posterUrl}
            alt={`Anteprima webcam in diretta per ${webcam.title || beachName}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

        {/* Center Live Play Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
          {webcam.liveUrl && (
            <a
              href={webcam.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-press flex items-center gap-3 rounded-full border border-white/40 bg-black/50 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-[background-color,transform] duration-200 hover:bg-black/70 hover:scale-105 active:scale-95"
            >
              <span className="grid size-9 place-items-center rounded-full bg-red-600 text-white shadow-sm">
                <Play aria-hidden="true" size={16} fill="currentColor" className="ml-0.5" />
              </span>
              <span>Guarda lo streaming in diretta</span>
            </a>
          )}
        </div>
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
