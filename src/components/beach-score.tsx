type BeachScoreProps = {
  score: number;
  label: string;
};

export function BeachScore({ score, label }: BeachScoreProps) {
  const displayScore = (Math.max(0, Math.min(100, score)) / 10).toFixed(1);

  return (
    <div aria-label={`Voto ${displayScore} su 10, ${label}`}>
      <span className="flex items-baseline gap-1">
        <strong className="font-serif text-[2.8rem] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">
          {displayScore}
        </strong>
        <span className="text-sm font-semibold text-[var(--muted)]">/10</span>
      </span>
      <span className="mt-1 block text-xs font-semibold text-[var(--ink-soft)]">{label}</span>
    </div>
  );
}
