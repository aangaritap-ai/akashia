type MarkProps = { className?: string };

// Un arco (puerta / nicho de memoria) con una luz dorada que permanece dentro.
export function LogoMark({ className = "w-8 h-8" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 41V22a14 14 0 0 1 28 0v19"
        stroke="var(--accent)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 41V23a7 7 0 0 1 14 0v18"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <circle cx="24" cy="26" r="3.4" fill="var(--gold)" />
    </svg>
  );
}

export function Logo({
  className = "",
  markClassName = "w-8 h-8",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className="font-display text-xl tracking-tight">Akashia</span>
    </span>
  );
}
