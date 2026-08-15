"use client";

export type DetailTab = "oggi" | "info" | "vento";

type DetailTabsProps = {
  active: DetailTab;
  onChange: (tab: DetailTab) => void;
};

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: "oggi", label: "Oggi" },
  { id: "info", label: "Info" },
  { id: "vento", label: "Vento" },
];

export function DetailTabs({ active, onChange }: DetailTabsProps) {
  return (
    <div className="flex min-h-12 gap-1 rounded-full bg-[var(--surface-muted)] p-1" role="tablist" aria-label="Dettagli spiaggia">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            "min-h-10 flex-1 rounded-full px-4 text-sm font-bold transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
            active === tab.id
              ? "bg-[var(--surface)] text-[var(--ink)] shadow-[0_4px_12px_rgba(20,44,57,0.1)]"
              : "text-[var(--muted)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
