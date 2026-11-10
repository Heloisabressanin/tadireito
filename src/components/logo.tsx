type LogoMarkProps = {
  className?: string;
};

/** The "Visto" mark: a white check with the yellow accent of "tá". */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect width="120" height="120" rx="28" fill="#0E7C4A" />
      <path
        d="M30 63 L51 83 L90 42"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M74 27 L90 16" fill="none" stroke="#FFC629" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

/** Horizontal lockup: mark + "tá direito" wordmark. */
export function Logo({ className }: LogoMarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LogoMark className="size-8" />
      <span className="text-[22px] font-extrabold tracking-tight">
        <span className="text-verde">tá</span> direito
      </span>
    </span>
  );
}
