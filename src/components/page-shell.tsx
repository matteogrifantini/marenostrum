import Link from "next/link";
import { Heart, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { AccountHeaderLabel } from "./account-header-label";
import { BrandMark } from "./brand-mark";
import { SiteFooter } from "./site-footer";

const utilityLinkClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold text-[var(--muted)] transition-colors";

export function PageShell({
  children,
  activeNav = "oggi",
}: {
  children: ReactNode;
  activeNav?: "oggi" | "mappa" | "impostazioni" | "none";
}) {
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
            className="hidden min-w-0 items-center gap-4 text-sm font-bold text-[var(--muted)] lg:flex"
          >
            <Link
              className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-2 transition-[border-color,color] duration-200 ease-out hover:text-[var(--sea-deep)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)] ${
                activeNav === "oggi"
                  ? "border-[var(--sun)] text-[var(--ink)]"
                  : "border-transparent text-[var(--muted)]"
              }`}
              href="/#classifica"
              prefetch={true}
            >
              {activeNav === "oggi" && (
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-[var(--sun)] shadow-[0_0_0_4px_rgba(255,194,71,0.22)]"
                />
              )}
              Spiagge
            </Link>

            <Link
              className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-2 transition-[border-color,color] duration-200 ease-out hover:text-[var(--sea-deep)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)] ${
                activeNav === "mappa"
                  ? "border-[var(--sun)] text-[var(--ink)]"
                  : "border-transparent text-[var(--muted)]"
              }`}
              href="/mappa"
              prefetch={true}
            >
              {activeNav === "mappa" && (
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-[var(--sun)] shadow-[0_0_0_4px_rgba(255,194,71,0.22)]"
                />
              )}
              Mappa
            </Link>
          </nav>


          <div className="hidden items-center gap-1 lg:ml-auto lg:flex">
            <Link
              href="/preferiti"
              prefetch={true}
              aria-label="Apri preferiti"
              title="Preferiti"
              className="inline-flex size-11 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--score-poor)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)]"
            >
              <Heart aria-hidden="true" size={18} />
            </Link>
            <Link
              href="/impostazioni"
              prefetch={true}
              aria-label="Apri impostazioni e accesso"
              className={`${utilityLinkClass} bg-[var(--surface)] shadow-[inset_0_0_0_1px_rgba(20,44,57,0.07)] hover:text-[var(--ink)]`}
            >
              <UserRound aria-hidden="true" size={16} />
              <AccountHeaderLabel />
            </Link>
          </div>
        </div>
      </header>
      {children}
      <SiteFooter />
    </div>
  );
}
