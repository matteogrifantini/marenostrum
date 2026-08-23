import Link from "next/link";

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/cookie", label: "Cookie" },
  { href: "/termini", label: "Termini e condizioni" },
];

export function SiteFooter() {
  return (
    <footer
      aria-label="Informazioni e link legali"
      className="border-t border-[var(--line)] bg-[var(--surface)]"
    >
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-9 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:gap-12 lg:py-11">
        <div>
          <p className="font-serif text-xl font-semibold tracking-[-0.04em]">Mare Nostrum</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
            Una bussola semplice per scegliere la spiaggia in base alle condizioni del mare.
          </p>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
            Informazioni
          </p>
          <nav aria-label="Link legali" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--sea-deep)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sun)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="text-sm leading-6 text-[var(--muted)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em]">Dati e limiti</p>
          <p className="mt-3">
            Meteo da{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]"
            >
              Open-Meteo
            </a>{" "}
            e DWD; cartografia Esri con dati OpenStreetMap, parcheggi e punti utili da OpenStreetMap.
          </p>
          <p className="mt-2">
            Le informazioni sono orientative: verifica sempre condizioni reali, divieti e indicazioni delle autorità.
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--line)] px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-1 text-xs leading-5 text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>© Mare Nostrum</span>
          <span>Nessun dato di navigazione viene usato per pubblicità o profilazione.</span>
        </div>
      </div>
    </footer>
  );
}
