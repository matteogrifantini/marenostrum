import { Waves } from "lucide-react";

type BrandMarkProps = {
  className?: string;
  iconSize?: number;
};

export function BrandMark({ className = "size-10", iconSize = 20 }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(145deg,var(--sea),var(--sun))] shadow-[0_6px_16px_rgba(20,44,57,0.14)] ${className}`}
    >
      <span className="absolute inset-[10%] rounded-full bg-[rgba(255,255,255,0.92)]" />
      <span className="absolute right-[14%] top-[14%] size-[22%] rounded-full bg-[var(--sun)]" />
      <Waves
        aria-hidden="true"
        className="relative z-10 text-[var(--sea-deep)]"
        size={iconSize}
        strokeWidth={2.4}
      />
    </span>
  );
}
