import { MobileNav } from "../../components/mobile-nav";
import { PageShell } from "../../components/page-shell";

export default function Loading() {
  return (
    <PageShell activeNav="impostazioni">
      <main
        aria-busy="true"
        aria-label="Caricamento impostazioni"
        className="min-h-screen pb-24 lg:pb-8"
      >
        <div className="mx-auto max-w-[48rem] px-4 py-6 sm:px-8 sm:py-10">
          <div
            role="status"
            aria-label="Caricamento impostazioni"
            className="sr-only"
          >
            Caricamento impostazioni
          </div>

          <div className="h-9 w-48 animate-pulse rounded-full bg-[var(--surface-muted)]" />
          <div className="mt-3 h-5 w-72 animate-pulse rounded-full bg-[var(--surface-muted)]" />

          <div className="mt-8 space-y-5">
            <div className="h-44 animate-pulse rounded-[1.75rem] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(20,44,57,0.06)]" />
            <div className="h-56 animate-pulse rounded-[1.75rem] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(20,44,57,0.06)]" />
          </div>
        </div>
      </main>
      <MobileNav active="impostazioni" />
    </PageShell>
  );
}
