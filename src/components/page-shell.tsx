import Link from "next/link";
import { Heart, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "./brand-mark";

const unavailableUtilityClass =
  "inline-flex min-h-11 cursor-default items-center justify-center gap-2 rounded-full px-3 text-sm font-bold text-[var(--muted)]";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[rgba(255,255,255,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.5rem] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
          <Link
            href="/"
            aria-label="Mare Nostrum, home"
            className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)]"
          >
            <BrandMark className="size-9" iconSize={17} />
            <span className="font-serif text-[1.15rem] font-semibold tracking-[-0.04em]">
              Mare Nostrum
            </span>
          </Link>

          <nav
            aria-label="Navigazione desktop"
            className="hidden min-w-0 items-center gap-3 text-sm font-bold text-[var(--muted)] lg:flex"
          >
            <Link
              className="inline-flex min-h-11 items-center gap-2 border-b-2 border-[var(--sun)] px-2 text-[var(--ink)] transition-[border-color,color] duration-200 ease-out hover:text-[var(--sea-deep)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)]"
              href="/#classifica"
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-[var(--sun)] shadow-[0_0_0_4px_rgba(255,194,71,0.22)]"
              />
              Oggi
            </Link>
          </nav>

          <div className="hidden items-center gap-1 lg:ml-auto lg:flex">
            <span
              role="status"
              aria-label="Condizioni meteo aggiornate"
              title="Condizioni meteo aggiornate"
              className="hidden size-9 items-center justify-center rounded-full border border-[rgba(20,44,57,0.1)] xl:inline-flex"
            >
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[var(--sea)] shadow-[0_0_0_4px_rgba(20,112,118,0.12)]"
              />
            </span>
            <button
              type="button"
              aria-disabled="true"
              aria-label="Preferiti, disponibile prossimamente"
              title="Preferiti"
              className="inline-flex size-11 cursor-default items-center justify-center rounded-full text-[var(--muted)]"
            >
              <Heart aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              aria-disabled="true"
              aria-label="Accedi, disponibile prossimamente"
              className={`${unavailableUtilityClass} bg-[var(--surface)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)]`}
            >
              <UserRound aria-hidden="true" size={16} />
              <span className="hidden xl:inline">Accedi</span>
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
