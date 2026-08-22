import { PageShell } from "../../../components/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <main
        aria-busy="true"
        aria-label="Caricamento scheda spiaggia"
        className="detail-page min-h-screen pb-24 lg:pb-8"
      >
        <div className="mx-auto max-w-[48rem] px-3 py-3 sm:px-6 sm:py-6">
          <div
            role="status"
            aria-label="Caricamento scheda spiaggia"
            className="sr-only"
          >
            Caricamento scheda spiaggia
          </div>
          <div
            aria-hidden="true"
            className="h-[20rem] rounded-[1.8rem] bg-[var(--surface-muted)] sm:h-[26rem]"
          />
          <div className="mt-6 space-y-3 px-1 sm:px-2">
            <div className="h-11 rounded-full bg-[var(--surface-muted)]" />
            <div className="h-24 rounded-[1.3rem] bg-[var(--surface-muted)]" />
            <div className="h-64 rounded-[1.3rem] bg-[var(--surface-muted)]" />
          </div>
        </div>
      </main>
    </PageShell>
  );
}
