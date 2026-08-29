import { MobileNav } from "../../components/mobile-nav";
import { PageShell } from "../../components/page-shell";

export default function Loading() {
  return (
    <PageShell activeNav="mappa">
      <main
        aria-busy="true"
        aria-label="Caricamento mappa delle spiagge"
        className="min-h-screen pb-24 lg:pb-8"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div
            role="status"
            aria-label="Caricamento mappa interattiva"
            className="sr-only"
          >
            Caricamento mappa interattiva
          </div>

          {/* Skeleton decision controls */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] p-3 shadow-[0_4px_20px_rgba(20,44,57,0.06)] sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-10 w-28 animate-pulse rounded-full bg-[var(--surface-muted)]" />
              <div className="h-10 w-24 animate-pulse rounded-full bg-[var(--surface-muted)]" />
              <div className="h-10 w-32 animate-pulse rounded-full bg-[var(--surface-muted)]" />
            </div>
            <div className="h-10 w-24 animate-pulse rounded-full bg-[var(--surface-muted)]" />
          </div>

          {/* Skeleton map container */}
          <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-muted)] shadow-[0_12px_40px_rgba(20,44,57,0.08)]">
            <div className="flex h-[68vh] min-h-[420px] w-full animate-pulse items-center justify-center bg-[linear-gradient(135deg,rgba(7,153,164,0.06),rgba(255,194,71,0.06))]">
              <div className="flex flex-col items-center gap-3">
                <div className="size-12 animate-spin rounded-full border-3 border-[var(--line)] border-t-[var(--sea)]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  Caricamento cartografia...
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileNav active="mappa" />
    </PageShell>
  );
}
