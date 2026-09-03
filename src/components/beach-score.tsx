import { formatScoreOutOf100 } from "../domain/score";

type BeachScoreProps = {
  score: number;
  label: string;
};

export function BeachScore({ score, label }: BeachScoreProps) {
  const displayScore = formatScoreOutOf100(score);

  return (
    <div aria-label={`Indice condizioni del mare: ${displayScore}/100, ${label}`}>
      <span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">
        Indice condizioni del mare
      </span>
      <span className="flex items-baseline gap-1">
        <strong className="font-serif text-[2.8rem] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">
          {displayScore}
        </strong>
        <span className="text-sm font-semibold text-[var(--muted)]">/100</span>
      </span>
      <span className="mt-1 block text-xs font-semibold text-[var(--ink-soft)]">{label}</span>
    </div>
  );
}
