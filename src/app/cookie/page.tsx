import type { Metadata } from "next";
import { LegalPageLayout } from "../../components/legal-page-layout";

export const metadata: Metadata = {
  title: "Informativa sui Cookie",
  description:
    "Informativa estesa sui cookie e sulle tecnologie di memorizzazione locale utilizzate da Mare Nostrum.",
  alternates: {
    canonical: "https://marenostrum.app/cookie",
  },
};

export default function CookiePage() {
  return (
    <LegalPageLayout
      title="Informativa sui Cookie"
      subtitle="Trasparenza completa sull'utilizzo di cookie e memorizzazione locale su Mare Nostrum."
      lastUpdated="23 agosto 2026"
    >
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          1. Cosa sono i Cookie e le Tecnologie Simili
        </h2>
        <p>
          I cookie sono piccoli file di testo che i siti web visitati inviano al dispositivo dell&apos;utente, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alle visite successive. Esistono inoltre tecnologie analoghe, come il <code>localStorage</code> del browser, che consentono di salvare informazioni direttamente sul dispositivo dell&apos;utente.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          2. Nessun Cookie di Profilazione o Pubblicità
        </h2>
        <div className="rounded-2xl bg-[var(--control-surface)] p-4 text-sm font-semibold text-[var(--ink)] sm:p-5">
          Mare Nostrum <strong>non utilizza cookie di profilazione</strong>, tracker commerciali o cookie pubblicitari di terze parti. Non tracciamo la tua cronologia tra siti diversi.
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          3. Tecnologie Tecniche Utilizzate
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[var(--line)] font-bold text-[var(--ink)]">
              <tr>
                <th className="py-2 pr-4">Nome / Chiave</th>
                <th className="py-2 pr-4">Tipologia</th>
                <th className="py-2 pr-4">Durata</th>
                <th className="py-2">Finalità</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
              <tr>
                <td className="py-3 pr-4 font-mono font-semibold text-[var(--ink)]">
                  marenostrum_community_reporter_v1
                </td>
                <td className="py-3 pr-4">Cookie Tecnico (HttpOnly)</td>
                <td className="py-3 pr-4">1 anno</td>
                <td className="py-3">
                  Identificativo pseudonimo generato dal server per prevenire spam e invii duplicati nelle segnalazioni community.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono font-semibold text-[var(--ink)]">
                  marenostrum:favorites:v1
                </td>
                <td className="py-3 pr-4">LocalStorage (Browser)</td>
                <td className="py-3 pr-4">Persistente sul dispositivo</td>
                <td className="py-3">
                  Memorizza l&apos;elenco delle spiagge salvate tra i preferiti per renderle accessibili ad ogni visita.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono font-semibold text-[var(--ink)]">
                  sb-*-auth-token
                </td>
                <td className="py-3 pr-4">Cookie tecnico di sessione</td>
                <td className="py-3 pr-4">Gestito da Supabase Auth</td>
                <td className="py-3">
                  Mantiene l&apos;accesso volontario per sincronizzare i preferiti e pubblicare o aggiornare recensioni della Community. Non è usato per pubblicità o profilazione.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono font-semibold text-[var(--ink)]">
                  marenostrum:notifications:v1
                </td>
                <td className="py-3 pr-4">LocalStorage (Browser)</td>
                <td className="py-3 pr-4">Persistente sul dispositivo</td>
                <td className="py-3">
                  Ricorda se hai abilitato gli avvisi locali; non contiene dati di navigazione.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono font-semibold text-[var(--ink)]">
                  marenostrum:preferences:v1
                </td>
                <td className="py-3 pr-4">LocalStorage (Browser)</td>
                <td className="py-3 pr-4">Persistente sul dispositivo</td>
                <td className="py-3">
                  Ricorda lingua e unità di misura scelte nelle impostazioni; non viene inviata ai server.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="preferenze" className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          4. Come Gestire o Disabilitare i Cookie
        </h2>
        <p>
          Puoi controllare, bloccare o cancellare i cookie attraverso le impostazioni del tuo browser. La disabilitazione dei cookie tecnici potrebbe limitare alcune funzionalità, come l&apos;invio di segnalazioni sulle spiagge.
        </p>
        <p>
          Istruzioni per i principali browser:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[var(--ink-soft)]">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline decoration-[var(--line)] hover:text-[var(--sea-deep)]"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline decoration-[var(--line)] hover:text-[var(--sea-deep)]"
            >
              Apple Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline decoration-[var(--line)] hover:text-[var(--sea-deep)]"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline decoration-[var(--line)] hover:text-[var(--sea-deep)]"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}
