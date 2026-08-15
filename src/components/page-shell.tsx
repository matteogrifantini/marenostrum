import { Waves } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[rgba(245,241,233,0.84)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.5rem] max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-8">
          <Link
            href="/"
            aria-label="Sicilia Beach, home"
            className="inline-flex min-h-11 items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)]"
          >
            <span className="grid size-9 place-items-center rounded-full bg-[var(--ink)] text-[var(--sand)]">
              <Waves aria-hidden="true" size={17} strokeWidth={2.4} />
            </span>
            <span className="font-serif text-[1.15rem] font-semibold tracking-[-0.04em]">
              Sicilia Beach
            </span>
          </Link>

          <nav aria-label="Navigazione desktop" className="hidden items-center gap-7 text-sm font-bold text-[var(--muted)] md:flex">
            <a className="transition-colors duration-200 hover:text-[var(--ink)]" href="#classifica">
              Spiagge
            </a>
            <a className="transition-colors duration-200 hover:text-[var(--ink)]" href="#come-funziona">
              Come funziona
            </a>
            <a
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-4 py-2.5 text-white transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sea-deep)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
              href="#classifica"
            >
              Esplora la costa
            </a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
