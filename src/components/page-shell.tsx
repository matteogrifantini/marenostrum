import Link from "next/link";
import { BookOpen, ChevronDown, Globe2, Heart, Map, Settings, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "./brand-mark";

const unavailableNavigationClass =
  "inline-flex min-h-11 cursor-default items-center gap-1 rounded-full px-3 text-sm font-bold text-[var(--muted)]";

const unavailableUtilityClass =
  "inline-flex min-h-11 cursor-default items-center justify-center gap-2 rounded-full px-3 text-sm font-bold text-[var(--muted)]";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[rgba(245,241,233,0.84)] backdrop-blur-xl">
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
            className="hidden min-w-0 items-center gap-1 text-sm font-bold text-[var(--muted)] lg:flex"
          >
            <Link
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-4 text-white shadow-[0_8px_20px_rgba(20,44,57,0.12)] transition-[transform,background-color] duration-200 ease-out hover:bg-[var(--sea-deep)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]"
              href="/#classifica"
            >
              Oggi
            </Link>
            <button
              type="button"
              aria-disabled="true"
              aria-label="Mappa, disponibile prossimamente"
              className={unavailableNavigationClass}
            >
              <Map aria-hidden="true" size={16} />
              Mappa
            </button>
            <button
              type="button"
              aria-disabled="true"
              aria-label="Blog, disponibile prossimamente"
              className={unavailableNavigationClass}
            >
              <BookOpen aria-hidden="true" size={16} />
              Blog
            </button>
            <button
              type="button"
              aria-disabled="true"
              aria-label="Regioni, disponibile prossimamente"
              className={unavailableNavigationClass}
            >
              Regioni
              <ChevronDown aria-hidden="true" size={15} />
            </button>
          </nav>

          <div className="hidden items-center gap-1 lg:ml-auto lg:flex">
            <button
              type="button"
              aria-disabled="true"
              aria-label="Lingua: Italiano, disponibile prossimamente"
              className={unavailableUtilityClass}
            >
              <Globe2 aria-hidden="true" size={16} />
              Italiano
              <ChevronDown aria-hidden="true" size={15} />
            </button>
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
              aria-label="Impostazioni, disponibile prossimamente"
              title="Impostazioni"
              className="inline-flex size-11 cursor-default items-center justify-center rounded-full text-[var(--muted)]"
            >
              <Settings aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              aria-disabled="true"
              aria-label="Accedi, disponibile prossimamente"
              className={`${unavailableUtilityClass} bg-[var(--surface)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)]`}
            >
              <UserRound aria-hidden="true" size={16} />
              Accedi
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
