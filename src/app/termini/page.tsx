import type { Metadata } from "next";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { LegalPageLayout } from "../../components/legal-page-layout";

export const metadata: Metadata = {
  title: "Termini e Condizioni d'Uso",
  description:
    "Termini d'uso di Mare Nostrum, disclaimer di sicurezza balneare, attribuzioni e limitazioni di responsabilità.",
  alternates: {
    canonical: "https://marenostrum.app/termini",
  },
};

export default function TerminiPage() {
  return (
    <LegalPageLayout
      title="Termini e Condizioni d'Uso"
      subtitle="Condizioni di utilizzo del servizio Mare Nostrum, disclaimer di responsabilità e sicurezza balneare."
      lastUpdated="23 agosto 2026"
    >
      <section className="rounded-2xl border border-[rgba(239,68,68,0.2)] bg-[rgba(254,242,242,0.6)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-1 shrink-0 text-red-600"
            size={22}
            aria-hidden="true"
          />
          <div className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-red-950 sm:text-xl">
              Disclaimer Fondamentale sulla Sicurezza Balneare
            </h2>
            <p className="text-xs leading-5 text-red-900 sm:text-sm sm:leading-6">
              Mare Nostrum fornisce <strong>modelli previsionali e stime orientative</strong>. Le condizioni del mare possono variare repentinamente a causa di microclimi locali, correnti sottomarine, secche, mareggiate improvvise e conformazione della costa.
            </p>
            <p className="text-xs leading-5 text-red-900 sm:text-sm sm:leading-6 font-semibold">
              Il servizio non si sostituisce in alcun modo alle ordinanze delle Capitanerie di Porto e della Guardia Costiera, alle bandiere di balneazione esposte dai lidi o alla vigilanza dei bagnini di salvataggio. L&apos;ingresso in mare e la balneazione rimangono sempre sotto la diretta responsabilità e prudenza dell&apos;utente.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          1. Oggetto e Natura del Servizio
        </h2>
        <p>
          Mare Nostrum è una piattaforma digitale accessibile all&apos;indirizzo <code>marenostrum.app</code>, progettata per aiutare residenti e visitatori a consultare le condizioni meteomarine aggregate (vento, onde, temperatura, precipitazioni) delle spiagge della Sicilia.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          2. Fonti Dati e Attribuzioni
        </h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
            <ShieldCheck size={18} className="text-[var(--sea-deep)]" aria-hidden="true" />
            Trasparenza Open Data
          </div>
          <p>
            Le previsioni meteomarine sono elaborate a partire dai dati aperti forniti da:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-[var(--ink-soft)]">
            <li>
              <strong>Open-Meteo</strong> e Deutscher Wetterdienst (DWD), rilasciati con licenza{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline decoration-[var(--line)] hover:text-[var(--sea-deep)]"
              >
                Creative Commons Attribution 4.0 International (CC BY 4.0)
              </a>
              .
            </li>
            <li>
              <strong>OpenStreetMap</strong> per i riferimenti geografici e le posizioni dei parcheggi, sotto licenza{" "}
              <a
                href="https://opendatacommons.org/licenses/odbl/"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline decoration-[var(--line)] hover:text-[var(--sea-deep)]"
              >
                Open Data Commons Open Database License (ODbL)
              </a>
              .
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          3. Segnalazioni della Community
        </h2>
        <p>
          Gli utenti possono inserire segnalazioni in tempo reale sulle condizioni osservate (ad esempio stato del mare, presenza di alghe o affollamento). È fatto espresso divieto di:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[var(--ink-soft)]">
          <li>Inserire informazioni deliberatamente false, fuorvianti o denigratorie.</li>
          <li>Utilizzare script o bot automatici per alterare le segnalazioni.</li>
          <li>Compiere azioni di sabotaggio commerciale o concorrenza sleale verso lidi, stabilimenti o strutture locali.</li>
        </ul>
        <p>
          Mare Nostrum si riserva il diritto di rimuovere o filtrare segnalazioni ritenute inattendibili o contrarie alle presenti condizioni.
          Il numero di conferme visualizzato accanto a una segnalazione indica quante identità tecniche distinte l&apos;hanno inviata nel periodo considerato; non costituisce una certificazione della verità del contenuto e non sostituisce le indicazioni delle autorità.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          4. Limitazione di Responsabilità
        </h2>
        <p>
          Nei limiti massimi consentiti dalla legge applicabile, Mare Nostrum non potrà essere ritenuta responsabile per eventuali danni diretti, indiretti o incidentali derivanti dall&apos;affidamento riposto nelle previsioni, dall&apos;accesso alle spiagge o dall&apos;impossibilità di utilizzare il servizio.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          5. Legge Applicabile
        </h2>
        <p>
          I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia relativa all&apos;interpretazione o esecuzione delle presenti condizioni sarà competente il Foro competente secondo la normativa applicabile.
        </p>
      </section>
    </LegalPageLayout>
  );
}
