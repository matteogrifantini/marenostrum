"use client";

import {
  Compass,
  Heart,
  Sparkles,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserIntent } from "../domain/beach";

type IntentFilterProps = {
  value: UserIntent;
  onChange: (intent: UserIntent) => void;
};

const intents: Array<{
  value: UserIntent;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "relax", label: "Staccare", icon: Heart },
  { value: "family", label: "Famiglia", icon: UsersRound },
  { value: "explore", label: "Esplorare", icon: Compass },
  { value: "water-sport", label: "Acqua", icon: Sparkles },
];

export function IntentFilter({ value, onChange }: IntentFilterProps) {
  return (
    <div
      aria-label="Cosa cerchi oggi?"
      className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
      role="group"
    >
      {intents.map(({ value: intent, label, icon: Icon }) => {
        const selected = value === intent;

        return (
          <button
            key={intent}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(intent)}
            className={[
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
              selected
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--line)] bg-white/70 text-[var(--ink-soft)] hover:border-[var(--sea)] hover:text-[var(--sea-deep)]",
            ].join(" ")}
          >
            <Icon aria-hidden="true" size={16} strokeWidth={2.2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
