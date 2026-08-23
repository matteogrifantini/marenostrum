import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "./page-shell";

type LegalPageLayoutProps = {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <PageShell>
      <main className="min-h-screen pb-20 pt-8 sm:pt-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--sea-deep)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Torna alle spiagge
            </Link>
          </div>

          <article className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_40px_rgba(20,44,57,0.06)] sm:p-10">
            <header className="border-b border-[var(--line)] pb-6 sm:pb-8">
              <h1 className="font-serif text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  {subtitle}
                </p>
              )}
              {lastUpdated && (
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Ultimo aggiornamento: {lastUpdated}
                </p>
              )}
            </header>

            <div className="mt-8 space-y-8 text-sm leading-7 text-[var(--ink-soft)] sm:text-base sm:leading-8">
              {children}
            </div>
          </article>
        </div>
      </main>
    </PageShell>
  );
}
