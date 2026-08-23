import type { Metadata } from "next";
import { LegalPageLayout } from "../../components/legal-page-layout";

export const metadata: Metadata = {
  title: "Informativa sulla Privacy",
  description:
    "Informativa sul trattamento dei dati personali (GDPR) di Mare Nostrum. Nessuna profilazione pubblicitaria né cessione a terzi.",
  alternates: {
    canonical: "https://marenostrum.app/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Informativa sulla Privacy"
      subtitle="Come Mare Nostrum rispetta la tua privacy e protegge i tuoi dati in conformità al Regolamento UE 2016/679 (GDPR)."
      lastUpdated="23 agosto 2026"
    >
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          1. Titolare del Trattamento
        </h2>
        <p>
          Il titolare del trattamento dei dati è <strong>Mare Nostrum</strong> (raggiungibile all&apos;indirizzo{" "}
          <a
            href="https://marenostrum.app"
            className="font-bold underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--sea-deep)]"
          >
            marenostrum.app
          </a>
          ). Per qualsiasi richiesta in materia di privacy, è possibile scrivere a{" "}
          <span className="font-bold text-[var(--ink)]">privacy@marenostrum.app</span>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          2. Dati Trattati e Finalità
        </h2>
        <p>
          Mare Nostrum è progettata secondo i principi di <em>privacy by design</em> e minimizzazione dei dati. Non richiediamo registrazione obbligatoria per consultare le condizioni del mare e non effettuiamo profilazione pubblicitaria.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-[var(--ink-soft)]">
          <li>
            <strong>Dati di navigazione e log tecnici</strong>: I server web acquisiscono temporaneamente dati tecnici (ad esempio indirizzo IP anonimizzato e tipo di browser) per fini esclusivi di sicurezza informatica e gestione dell&apos;infrastruttura di rete.
          </li>
          <li>
            <strong>Segnalazioni della Community e cookie anti-spam</strong>: Quando invii una segnalazione sulle condizioni del mare, utilizziamo un identificativo pseudonimo casuale generato dal server e salvato in un cookie tecnico protetto (<code>marenostrum_community_reporter_v1</code>). Questo identificativo serve unicamente ad applicare limiti di frequenza (rate limiting) e a evitare inserimenti duplicati o spam, senza collegare l&apos;attività a una persona fisica identificata.
          </li>
          <li>
            <strong>Geolocalizzazione (&quot;Vicino a me&quot;)</strong>: Quando attivi la ricerca per prossimità, le coordinate GPS vengono elaborate in tempo reale dal browser per calcolare la distanza chilometrica dalle spiagge. Le tue coordinate non vengono salvate su database né inviate a provider terzi di tracciamento.
          </li>
          <li>
            <strong>Spiagge Preferite</strong>: Le spiagge salvate tra i preferiti sono memorizzate esclusivamente nello spazio locale del tuo dispositivo (<code>localStorage</code>) e non vengono trasmesse ai nostri server.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          3. Base Giuridica del Trattamento
        </h2>
        <p>
          Il trattamento dei dati tecnici e degli identificativi anonimi di segnalazione si fonda sul <strong>legittimo interesse</strong> del titolare (Art. 6, par. 1, lett. f del GDPR) a garantire il corretto funzionamento della piattaforma, prevenire abusi e fornire previsioni attendibili agli utenti.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          4. Condivisione dei Dati e Terze Parti
        </h2>
        <p>
          I dati degli utenti <strong>non vengono venduti, ceduti né trasferiti a scopi commerciali o pubblicitari</strong>. Per l&apos;erogazione del servizio ci avvaliamo di fornitori di hosting e database (Vercel e Supabase) che operano in qualità di responsabili del trattamento nel rispetto delle normative vigenti in materia di protezione dei dati.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          5. Conservazione dei Dati
        </h2>
        <p>
          Le segnalazioni della community vengono archiviate per il periodo necessario a calcolare lo storico delle condizioni marine e perdono rilevanza pubblica dopo 24 ore. I log tecnici di sistema vengono conservati per il tempo strettamente necessario all&apos;analisi della sicurezza e alla risoluzione di problemi operativi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-2xl">
          6. Diritti dell&apos;Interessato
        </h2>
        <p>
          In conformità agli articoli 15-22 del GDPR, hai il diritto di richiedere l&apos;accesso ai tuoi dati, la rettifica, la cancellazione o la limitazione del trattamento, nonché di opporti al trattamento dei tuoi dati personali scrivendo a{" "}
          <span className="font-bold text-[var(--ink)]">privacy@marenostrum.app</span>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
