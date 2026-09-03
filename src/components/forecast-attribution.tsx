const sources = [
  { href: "https://open-meteo.com/", label: "Open-Meteo" },
  { href: "https://www.dwd.de/", label: "DWD" },
];

type ForecastAttributionProps = {
  includeParkingSource?: boolean;
  freshnessText?: string;
  disclaimer?: string;
};

export function ForecastAttribution({
  includeParkingSource = false,
  freshnessText,
  disclaimer,
}: ForecastAttributionProps) {
  return (
    <footer
      aria-label="Attribuzione previsioni"
      className="mt-3 border-t border-[var(--line)] px-2 py-1 text-center text-[0.62rem] leading-4 text-[var(--muted)]"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        <span>Fonti meteo:</span>
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
        {includeParkingSource ? (
          <>
            <span aria-hidden="true">·</span>
            <span>Parcheggi:</span>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline decoration-[var(--line)] underline-offset-2 hover:text-[var(--ink)]"
            >
              © OpenStreetMap contributors
            </a>
          </>
        ) : null}
      </div>
      {freshnessText || disclaimer ? (
        <div className="mt-0.5 flex flex-col items-center gap-0">
          {freshnessText ? <p>{freshnessText}</p> : null}
          {disclaimer ? <p>{disclaimer}</p> : null}
        </div>
      ) : null}
    </footer>
  );
}
