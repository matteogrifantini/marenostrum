const sources = [
  { href: "https://open-meteo.com/", label: "Open-Meteo" },
  { href: "https://www.dwd.de/", label: "DWD" },
];

export function ForecastAttribution() {
  return (
    <footer
      aria-label="Attribuzione previsioni"
      className="mt-3 flex flex-wrap items-center justify-center gap-x-1.5 border-t border-[var(--line)] px-2 py-2 text-center text-[0.62rem] leading-4 text-[var(--muted)]"
    >
      <span>Fonti:</span>
      {sources.map((source, index) => (
        <span key={source.label} className="inline-flex items-center gap-1.5">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <a
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline decoration-[var(--line)] underline-offset-2 hover:text-[var(--ink)]"
          >
            {source.label}
          </a>
        </span>
      ))}
      <span aria-hidden="true">·</span>
      <a
        href="https://creativecommons.org/licenses/by/4.0/"
        target="_blank"
        rel="noreferrer"
        className="font-semibold underline decoration-[var(--line)] underline-offset-2 hover:text-[var(--ink)]"
      >
        CC BY 4.0
      </a>
    </footer>
  );
}
