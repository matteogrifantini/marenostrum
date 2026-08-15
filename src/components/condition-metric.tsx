import type { ReactNode } from "react";

type ConditionMetricProps = {
  icon: ReactNode;
  label: string;
  value: string;
  description?: string;
};

export function ConditionMetric({
  icon,
  label,
  value,
  description,
}: ConditionMetricProps) {
  return (
    <div
      aria-label={`${label}: ${value}${description ? `, ${description}` : ""}`}
      className="flex min-w-0 items-start gap-2.5 text-sm text-[var(--ink-soft)]"
      role="group"
    >
      <span className="mt-0.5 shrink-0 text-[var(--sea-deep)]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {label}
        </span>
        <span className="block truncate font-semibold text-[var(--ink)]">{value}</span>
        {description ? (
          <span className="block truncate text-xs text-[var(--muted)]">{description}</span>
        ) : null}
      </span>
    </div>
  );
}
