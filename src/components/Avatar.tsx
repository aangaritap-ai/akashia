const PALETTE: [string, string][] = [
  ["#e4eaf1", "#1b3a5c"],
  ["#f2e6d2", "#8a6a36"],
  ["#e3ebe4", "#44624a"],
  ["#f1dfd9", "#8b4a3a"],
];

const SIZES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-xl",
  xl: "w-24 h-24 text-4xl",
};

/** Fondo y letra para quien no tiene foto, estables según el nombre. */
export function colorFor(name: string): [string, string] {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export default function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const base = `${SIZES[size]} rounded-full shrink-0 overflow-hidden ${className}`;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className={`${base} object-cover`} />
    );
  }

  const [bg, fg] = colorFor(name);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      aria-label={name}
      className={`${base} flex items-center justify-center font-display`}
      style={{ background: bg, color: fg }}
    >
      {initial}
    </div>
  );
}
