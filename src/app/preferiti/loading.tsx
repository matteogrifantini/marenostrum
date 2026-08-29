import { MobileNav } from "../../components/mobile-nav";
import { PageShell } from "../../components/page-shell";

export default function Loading() {
  return (
    <PageShell activeNav="none">
      <main
        aria-busy="true"
        aria-label="Caricamento spiagge preferite"
        className="min-h-screen pb-24 lg:pb-8"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-10">
          <div
            role="status"
            aria-label="Caricamento spiagge preferite"
            className="sr-only"
          >
            Caricamento spiagge preferite
          </div>

          <div className="h-9 w-48 animate-pulse rounded-full bg-[var(--surface-muted)]" />
          <div className="mt-3 h-5 w-72 animate-pulse rounded-full bg-[var(--surface-muted)]" />

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            <div className="h-64 animate-pulse rounded-[1.25rem] bg-[var(--surface-muted)]" />
            <div className="h-64 animate-pulse rounded-[1.25rem] bg-[var(--surface-muted)]" />
            <div className="h-64 animate-pulse rounded-[1.25rem] bg-[var(--surface-muted)]" />
          </div>
        </div>
      </main>
      <MobileNav active="impostazioni" />
    </PageShell>
  );
}
