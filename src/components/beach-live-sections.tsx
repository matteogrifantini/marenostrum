"use client";

import { ArrowUpRight, Check, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import type { Beach } from "../domain/beach";
import type { BeachDetailContent } from "../data/demo-beach-details";

type BeachLiveSectionsProps = {
  beach: Beach;
  detail: BeachDetailContent;
};

export function BeachLiveSections({ beach, detail }: BeachLiveSectionsProps) {
  const [showAllReports, setShowAllReports] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const reports = showAllReports ? detail.reports : detail.reports.slice(0, 3);
  const mapsQuery = beach.latitude && beach.longitude
    ? `${beach.latitude},${beach.longitude}`
    : beach.name;

  return (
    <>
      <SectionHeading title="Segnalazioni" />
      <section className="detail-surface detail-enter p-4 sm:p-5" aria-label="Segnalazioni">
        <ul role="list" aria-label="Segnalazioni recenti" className="mt-3">
          {reports.map((report) => (
            <li key={report.id} className="grid grid-cols-[2.2rem_1fr_auto] items-start gap-3 border-b border-[var(--line)] py-3 last:border-b-0">
              <span aria-hidden="true" className="detail-emoji">{report.emoji}</span>
              <div className="min-w-0">
                <strong className="block text-sm">{report.title}</strong>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{report.detail}</p>
              </div>
              <time className="pt-0.5 text-xs font-bold text-[var(--muted)]">{report.age}</time>
            </li>
          ))}
        </ul>
        {reports.length === 0 ? <p className="mt-3 text-sm text-[var(--muted)]">Nessuna segnalazione recente disponibile.</p> : null}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setShowAllReports((current) => !current)} className="detail-press min-h-11 rounded-[0.85rem] bg-[var(--surface-muted)] px-2 text-xs font-extrabold">
            {showAllReports ? "Mostra meno" : `Mostra tutte · ${detail.reports.length}`}
          </button>
          <button type="button" aria-pressed={reportReady} onClick={() => setReportReady(true)} className="detail-press inline-flex min-h-11 items-center justify-center gap-1 rounded-[0.85rem] border border-[var(--sea)]/15 bg-[var(--sea-soft)]/65 px-2 text-xs font-extrabold text-[var(--sea-deep)]">
            {reportReady ? <Check aria-hidden="true" size={15} /> : <Plus aria-hidden="true" size={15} />} Pronta
          </button>
        </div>
        {reportReady ? <p aria-live="polite" className="mt-3 text-center text-xs font-semibold text-[var(--sea-deep)]">La segnalazione verrà inviata dalla community area.</p> : null}
      </section>

      <section aria-label="Parcheggi vicini">
        <SectionHeading title="Parcheggi vicini" meta="vedi mappa" />
        <div className="grid grid-cols-2 gap-2">
          {detail.parkings.map((parking) => (
            <article key={parking.id} className="detail-surface detail-enter flex min-h-[12rem] min-w-0 flex-col p-3 sm:p-4">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between">
                <h2 className="text-base font-extrabold leading-[1.08] tracking-[-0.025em]">{parking.name}</h2>
                <span className="shrink-0 rounded-full bg-[var(--sun-soft)] px-2 py-1 text-[0.65rem] font-black text-[var(--sun-dark)]">{parking.price}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--ink-soft)]">🅿️ {parking.type}<br />🚶 {parking.walking}</p>
              <p className="mt-3 text-[0.62rem] leading-4 text-[var(--muted)]">{parking.updated}</p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${parking.name} ${mapsQuery}`)}`} target="_blank" rel="noreferrer" className="mt-auto flex min-h-11 items-center justify-between border-t border-[var(--line)] pt-3 text-xs font-extrabold text-[var(--sea-deep)]">
                Indicazioni <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </article>
          ))}
        </div>
        {detail.parkings.length === 0 ? <p className="detail-surface detail-enter p-4 text-sm text-[var(--muted)]">Nessun parcheggio disponibile.</p> : null}
      </section>

      <section aria-label="Informazioni generali">
        <SectionHeading title="La spiaggia" />
        <article className="detail-surface detail-enter p-4 sm:p-5">
          <CardTitle emoji="🏖️" title={beach.name} subtitle="Caratteristiche che non cambiano col meteo" />
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]"><MapPin aria-hidden="true" size={14} /> {beach.municipality} · costa {beach.coast.toLowerCase()}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{beach.description}</p>
          <div className="mt-4 grid grid-cols-2 border-t border-[var(--line)]">
            {detail.facts.map((fact, index) => (
              <div key={fact.label} className={`grid grid-cols-[2rem_1fr] gap-2 border-[var(--line)] px-2 py-4 ${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b" : ""}`}>
                <span aria-hidden="true" className="detail-emoji">{fact.emoji}</span>
                <div><strong className="block text-xs">{fact.label}</strong><span className="mt-1 block text-[0.68rem] leading-4 text-[var(--muted)]">{fact.value}</span></div>
              </div>
            ))}
          </div>
          {detail.facts.length === 0 ? <p className="mt-4 text-sm text-[var(--muted)]">Nessuna informazione aggiuntiva disponibile.</p> : null}
        </article>
      </section>
    </>
  );
}

function CardTitle({ emoji, title, subtitle, id }: { emoji: string; title: string; subtitle: string; id?: string }) {
  return <div className="flex items-center gap-3"><span aria-hidden="true" className="detail-emoji">{emoji}</span><div><h2 id={id} className="text-base font-extrabold tracking-[-0.025em]">{title}</h2><p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p></div></div>;
}

function SectionHeading({ title, meta = "" }: { title: string; meta?: string }) {
  return <div className="mx-1 mb-2 mt-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2>{meta ? <span className="text-xs font-bold text-[var(--sea)]">{meta}</span> : null}</div>;
}
