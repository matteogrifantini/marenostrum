const sources = [
  { href: "https://open-meteo.com/", label: "Open-Meteo" },
  { href: "https://www.dwd.de/", label: "DWD" },
];

export function ForecastAttribution() {
  return (
    <footer
      aria-label="Attribuzione previsioni"
      className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-[var(--line)] px-2 py-4 text-center text-[0.68rem] leading-5 text-[var(--muted)]"
    >
      <p>Previsioni indicative: non usare per la navigazione.</p>
      <span aria-hidden="true">·</span>
      <p>
        Fonti: {sources.map((source, index) => (
          <span key={source.label}>
            {index > 0 ? " e " : ""}
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
        {" · "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline decoration-[var(--line)] underline-offset-2 hover:text-[var(--ink)]"
        >
          CC BY 4.0
        </a>
      </p>
      <span aria-hidden="true">·</span>
      <p>Mare Nostrum aggrega ed elabora i dati.</p>
    </footer>
  );
}
