type BrandMarkProps = {
  className?: string;
  iconSize?: number;
};

export function BrandMark({ className = "size-9", iconSize = 18 }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#0799a4_0%,#0c6170_55%,#ffc247_100%)] p-1 shadow-[0_3px_12px_rgba(7,153,164,0.22)] ring-1 ring-black/5 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full"
        style={{ width: iconSize, height: iconSize }}
      >
        <circle cx="17" cy="7" r="3.2" fill="#ffc247" />
        <path
          d="M2.5 13C5 11 8 11 10.5 13C13 15 16 15 18.5 13C20 11.8 21.5 11.5 22.5 12"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 17.5C5 15.5 8 15.5 10.5 17.5C13 19.5 16 19.5 18.5 17.5C20 16.3 21.5 16 22.5 16.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.85"
        />
      </svg>
    </span>
  );
}
