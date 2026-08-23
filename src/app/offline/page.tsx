import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sei offline",
  description: "Mare Nostrum non riesce a raggiungere il servizio in questo momento.",
};

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-center text-[var(--ink)]">
      <section className="max-w-md rounded-[1.75rem] bg-[var(--surface)] p-8 shadow-[0_18px_60px_rgba(20,44,57,0.08)]">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sea-deep)]">Mare Nostrum</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.05em]">Sei offline</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Le previsioni richiedono una connessione. Torna online e riprova per vedere gli ultimi dati.</p>
      </section>
    </main>
  );
}
