"use client";

import { ArrowUpRight, Plus, X } from "lucide-react";
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

const REPORT_PREVIEW_LIMIT = 3;

export function BeachLiveSections({ beach, detail }: BeachLiveSectionsProps) {
  const [showAllReports, setShowAllReports] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CommunityReportCategory | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "submitting">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [localReports, setLocalReports] = useState<BeachDetailReport[]>([]);
  const allReports = [...localReports, ...detail.reports];
  const canShowAllReports = allReports.length > REPORT_PREVIEW_LIMIT;
  const reports = showAllReports && canShowAllReports ? allReports : allReports.slice(0, REPORT_PREVIEW_LIMIT);

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
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : "Non siamo riusciti ad aggiungerla. Riprova.");
    } finally {
      setSubmitState("idle");
    }
  }

  return (
    <>
      <ParkingSection beach={beach} detail={detail} />
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
        <div className={`mt-3 ${canShowAllReports ? "grid grid-cols-2 gap-2" : "flex justify-end"}`}>
          {canShowAllReports ? (
            <button type="button" onClick={() => setShowAllReports((current) => !current)} className="detail-press inline-flex min-h-11 items-center justify-center rounded-[0.85rem] border border-[var(--line)] bg-[var(--surface)] px-2 text-xs font-extrabold text-[var(--ink)] transition-[background-color,border-color,transform] duration-200 ease-out hover:border-[var(--sun)] hover:bg-[var(--sun-soft)] active:scale-[0.98]">
              {showAllReports ? "Mostra meno" : `Mostra tutte · ${allReports.length}`}
            </button>
          ) : null}
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
            className={`detail-press inline-flex min-h-11 items-center justify-center gap-1 rounded-[0.85rem] border border-[var(--sun)]/45 bg-[var(--sun-soft)] px-2 text-xs font-extrabold text-[var(--ink)] transition-[background-color,border-color,transform] duration-200 ease-out hover:border-[var(--sun)] hover:bg-[var(--sun)] active:scale-[0.98] ${canShowAllReports ? "" : "w-full sm:w-auto"}`}
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
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-[0.8rem] border px-3 text-xs font-bold transition-colors ${isSelected ? "border-[var(--sun)] bg-[var(--sun-soft)] text-[var(--ink)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]"}`}
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
                        className={`flex min-h-11 cursor-pointer items-center rounded-[0.8rem] border px-3 text-xs font-bold transition-colors ${isSelected ? "border-[var(--sun)] bg-[var(--sun-soft)] text-[var(--ink)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)]"}`}
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
              <button type="submit" disabled={!selectedCategory || !selectedDetail || submitState === "submitting"} className="detail-press min-h-10 rounded-[0.75rem] bg-[var(--sun)] px-4 text-xs font-extrabold text-[var(--ink)] transition-[background-color,transform] duration-200 ease-out hover:bg-[var(--sun-dark)] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                {submitState === "submitting" ? "Invio…" : "Pubblica"}
              </button>
            </div>
          </form>
        ) : null}
      </section>

    </>
  );
}

function ParkingSection({ beach, detail }: BeachLiveSectionsProps) {
  return (
    <section aria-label="Parcheggi vicini">
      <SectionHeading title="Parcheggi vicini" meta="vedi mappa" />
      {detail.parkings.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {detail.parkings.map((parking) => (
            <article key={parking.id} className="detail-surface detail-enter flex min-h-[12rem] min-w-0 flex-col p-3 sm:p-4">
              <div>
                <h2 className="text-base font-extrabold leading-[1.08] tracking-[-0.025em]">{parking.name}</h2>
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
      ) : (
        <article className="detail-surface detail-enter flex min-h-[10rem] flex-col p-4 sm:p-5">
          <p className="text-sm leading-6 text-[var(--muted)]"><span aria-hidden="true" className="emoji-readable-mobile">🅿️</span> Nessun parcheggio verificato per questa spiaggia.</p>
          <a
            href={buildGoogleMapsSearchUrl(`Parcheggi vicino a ${beach.name}, ${beach.municipality}`)}
            target="_blank"
            rel="noreferrer"
            aria-label="Cerca parcheggi vicini su Google Maps"
            className="mt-auto flex min-h-11 items-center justify-between border-t border-[var(--line)] pt-3 text-xs font-extrabold text-[var(--sea-deep)]"
          >
            Cerca parcheggi vicini su Google Maps <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </article>
      )}
    </section>
  );
}

function SectionHeading({ title, meta = "" }: { title: string; meta?: string }) {
  return <div className="mx-1 mb-2 mt-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-[-0.03em]">{title}</h2>{meta ? <span className="text-xs font-bold text-[var(--sea)]">{meta}</span> : null}</div>;
}
