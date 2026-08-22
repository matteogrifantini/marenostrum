import { Map, Settings, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type MobileNavProps = {
  active?: "oggi" | "mappa" | "impostazioni";
};

const items: Array<{
  id: "oggi" | "mappa" | "impostazioni";
  label: string;
  icon: LucideIcon;
  href?: string;
}> = [
  { id: "oggi", label: "Oggi", icon: Sun, href: "#classifica" },
  { id: "mappa", label: "Mappa", icon: Map },
  { id: "impostazioni", label: "Impostazioni", icon: Settings },
] as const;

export function MobileNav({ active = "oggi" }: MobileNavProps) {
  return (
    <nav
      aria-label="Navigazione mobile"
      className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 rounded-[1.4rem] bg-[rgba(255,255,255,0.94)] p-1.5 shadow-[0_18px_50px_rgba(20,44,57,0.18)] backdrop-blur-xl lg:hidden"
    >
      {items.map(({ id, label, icon: Icon, href }) => {
        const isActive = id === active;
        const className = [
          "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[1rem] px-2 text-[0.65rem] font-bold transition-[transform,background-color,color] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sun)]",
          isActive
            ? "bg-[var(--ink)] text-white"
            : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
        ].join(" ");

        if (href) {
          return (
            <a key={id} href={href} aria-current={isActive ? "page" : undefined} className={className}>
              <Icon aria-hidden="true" size={17} />
              {label}
            </a>
          );
        }

        return (
          <button
            key={id}
            type="button"
            aria-disabled="true"
            aria-label={`${label}, disponibile prossimamente`}
            className={`${className} cursor-default opacity-60`}
          >
            <Icon aria-hidden="true" size={17} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
