"use client";

import { ArrowUpRight, MapPin, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Beach } from "../domain/beach";
import {
  communityReportCategories,
  getCommunityReportDetailOptions,
  type CommunityReportCategory,
} from "../domain/community-reports";
import type {
  BeachDetailContent,
  BeachDetailReport,
} from "../domain/beach-detail-content";
import { buildGoogleMapsSearchUrl } from "../lib/maps-links";

type BeachLiveSectionsProps = {
  beach: Beach;
  detail: BeachDetailContent;
};

export function BeachLiveSections({ beach, detail }: BeachLiveSectionsProps) {
  const [showAllReports, setShowAllReports] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CommunityReportCategory | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "submitting">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [localReports, setLocalReports] = useState<BeachDetailReport[]>([]);
  const allReports = [...localReports, ...detail.reports];
  const reports = showAllReports ? allReports : allReports.slice(0, 3);

  function closeComposer() {
    setIsComposerOpen(false);
    setSelectedCategory(null);
    setSelectedDetail(null);
    setSubmitError(null);
  }

  async function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCategory || !selectedDetail || submitState === "submitting") return;

    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const response = await fetch("/api/community/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: beach.slug,
          category: selectedCategory,
          detail: selectedDetail,
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        report?: BeachDetailReport;
        error?: string;
      } | null;
      const report = body?.report;

      if (!response.ok || !report) {
        throw new Error(body?.error ?? "Community report submission failed");
      }

      setLocalReports((current) => [report, ...current]);
      closeComposer();
    } catch {
      setSubmitError("Non siamo riusciti ad aggiungerla. Riprova.");
    } finally {
      setSubmitState("idle");
    }
  }

  return (
    <>
      <SectionHeading title="Segnalazioni" />
      <section className="detail-surface detail-enter p-4 sm:p-5" aria-label="Segnalazioni">
        <ul role="list" aria-label="Segnalazioni recenti" className="mt-3">
          {reports.map((report) => (
            <li key={report.id} className="grid grid-cols-[2.35rem_1fr_auto] items-start gap-3 border-b border-[var(--line)] py-3 last:border-b-0 sm:grid-cols-[2.2rem_1fr_auto]">
              <span aria-hidden="true" className="detail-emoji detail-emoji-mobile">{report.emoji}</span>
              <div className="min-w-0">
                <strong className="block text-sm">{report.title}</strong>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{report.detail}</p>
              </div>
              <div className="pt-0.5 text-right">
                {typeof report.confirmations === "number" ? (
                  <span className="block text-xs font-black text-[var(--sea-deep)]">
                    {report.confirmations} {report.confirmations === 1 ? "utente" : "utenti"}
                  </span>
                ) : null}
                <time className="block text-xs font-bold text-[var(--muted)]">{report.age}</time>
              </div>
            </li>
          ))}
        </ul>
        {reports.length === 0 ? <p className="mt-3 text-sm text-[var(--muted)]">Nessuna segnalazione recente disponibile.</p> : null}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setShowAllReports((current) => !current)} className="detail-press min-h-11 rounded-[0.85rem] bg-[var(--surface-muted)] px-2 text-xs font-extrabold">
            {showAllReports ? "Mostra meno" : `Mostra tutte · ${allReports.length}`}
          </button>
          <button
            type="button"
            aria-expanded={isComposerOpen}
            aria-label={isComposerOpen ? "Chiudi" : "Aggiungi"}
            onClick={() => {
              if (isComposerOpen) {
                closeComposer();
              } else {
                setSubmitError(null);
                setIsComposerOpen(true);
              }
            }}
            className="detail-press inline-flex min-h-11 items-center justify-center gap-1 rounded-[0.85rem] border border-[var(--sea)]/15 bg-[var(--sea-soft)]/65 px-2 text-xs font-extrabold text-[var(--sea-deep)]"
          >
            {isComposerOpen ? <X aria-hidden="true" size={15} /> : <Plus aria-hidden="true" size={15} />} {isComposerOpen ? "Chiudi" : "Aggiungi"}
          </button>
        </div>
        {isComposerOpen ? (
          <form aria-label="Aggiungi una segnalazione" onSubmit={handleReportSubmit} className="mt-4 rounded-[1rem] bg-[var(--surface-muted)]/70 p-3">
            <fieldset>
              <legend className="text-sm font-extrabold">Cosa vuoi segnalare?</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {communityReportCategories.map((option) => {
                  const isSelected = selectedCategory === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-[0.8rem] border px-3 text-xs font-bold transition-colors ${isSelected ? "border-[var(--sea)] bg-[var(--sea-soft)] text-[var(--sea-deep)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]"}`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name={`report-category-${beach.slug}`}
                        value={option.value}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedCategory(option.value);
                          setSelectedDetail(null);
                        }}
                      />
                      <span aria-hidden="true" className="text-base">{option.emoji}</span>
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {selectedCategory ? (
              <fieldset className="mt-3">
                <legend className="text-xs font-extrabold">Scegli il dettaglio</legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {getCommunityReportDetailOptions(selectedCategory).map((option) => {
                    const isSelected = selectedDetail === option.label;

                    return (
                      <label
                        key={option.value}
                        className={`flex min-h-11 cursor-pointer items-center rounded-[0.8rem] border px-3 text-xs font-bold transition-colors ${isSelected ? "border-[var(--sea)] bg-[var(--sea-soft)] text-[var(--sea-deep)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]"}`}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name={`report-detail-${beach.slug}`}
                          value={option.value}
                          checked={isSelected}
                          onChange={() => setSelectedDetail(option.label)}
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}
            {submitError ? <p role="alert" className="mt-2 text-xs font-bold text-[var(--coral)]">{submitError}</p> : null}
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={closeComposer} className="detail-press min-h-10 rounded-[0.75rem] px-3 text-xs font-extrabold text-[var(--muted)]">
                Annulla
              </button>
              <button type="submit" disabled={!selectedCategory || !selectedDetail || submitState === "submitting"} className="detail-press min-h-10 rounded-[0.75rem] bg-[var(--sea-soft)] px-4 text-xs font-extrabold text-[var(--sea-deep)] disabled:cursor-not-allowed disabled:opacity-50">
                {submitState === "submitting" ? "Invio…" : "Pubblica"}
              </button>
            </div>
          </form>
        ) : null}
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
              <p className="mt-3 text-xs leading-5 text-[var(--ink-soft)]"><span aria-hidden="true" className="emoji-readable-mobile">🅿️</span> {parking.type}<br /><span aria-hidden="true" className="emoji-readable-mobile">🚶</span> {parking.walking}</p>
              <p className="mt-3 text-[0.62rem] leading-4 text-[var(--muted)]">{parking.updated}</p>
              <a
                href={parking.directionsUrl ?? buildGoogleMapsSearchUrl(`${parking.name}, ${beach.name}, ${beach.municipality}`)}
                target="_blank"
                rel="noreferrer"
                aria-label={`${parking.directionsUrl ? "Apri percorso" : "Cerca"} per ${parking.name} su Google Maps`}
                className="mt-auto flex min-h-11 items-center justify-between border-t border-[var(--line)] pt-3 text-xs font-extrabold text-[var(--sea-deep)]"
              >
                {parking.directionsUrl ? "Apri percorso" : "Cerca su Maps"} <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </article>
          ))}
        </div>
        {detail.parkings.some((parking) => parking.sourceUrl?.includes("openstreetmap.org")) ? (
          <p className="mt-2 text-[0.65rem] text-[var(--muted)]">
            Dati parcheggi: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="font-bold text-[var(--sea-deep)]">© OpenStreetMap contributors</a>
          </p>
        ) : null}
        {detail.parkings.length === 0 ? <p className="detail-surface detail-enter p-4 text-sm text-[var(--muted)]">Nessun parcheggio disponibile.</p> : null}
      </section>

      <section aria-label="La spiaggia">
        <SectionHeading title="La spiaggia" />
        <article className="detail-surface detail-enter p-4 sm:p-5">
          <CardTitle emoji="🏖️" title={beach.name} />
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]"><MapPin aria-hidden="true" size={14} /> {beach.municipality} · costa {beach.coast.toLowerCase()}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{beach.description}</p>
          <div className="mt-4 grid grid-cols-2 border-t border-[var(--line)]">
            {detail.facts.map((fact, index) => (
              <div key={`${fact.label}-${index}`} className={`grid grid-cols-[2.35rem_1fr] gap-2 border-[var(--line)] px-2 py-4 sm:grid-cols-[2rem_1fr] ${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b" : ""}`}>
                <span aria-hidden="true" className="detail-emoji detail-emoji-mobile">{fact.emoji}</span>
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

function CardTitle({ emoji, title, id }: { emoji: string; title: string; id?: string }) {
  return <div className="flex items-center gap-3"><span aria-hidden="true" className="detail-emoji detail-emoji-mobile">{emoji}</span><h2 id={id} className="text-base font-extrabold tracking-[-0.025em]">{title}</h2></div>;
}

function SectionHeading({ title, meta = "" }: { title: string; meta?: string }) {
  return <div className="mx-1 mb-2 mt-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2>{meta ? <span className="text-xs font-bold text-[var(--sea)]">{meta}</span> : null}</div>;
}
