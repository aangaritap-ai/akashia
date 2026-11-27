import type { ReactNode } from "react";

// Piezas de interfaz compartidas, para que todas las pantallas se vean igual.

export const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted/60 disabled:bg-black/[0.03] disabled:text-muted";

export const labelClass = "text-sm font-medium text-foreground";

export const primaryButtonClass =
  "rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm hover:brightness-110 disabled:opacity-60";

// "Tomar foto" y "Grabar video".
export const cameraButtonClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-accent hover:border-accent focus-within:border-accent disabled:opacity-60";

// Botones a lo ancho de una tarjeta o repartidos en una fila.
export const blockPrimaryClass =
  "w-full rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110 disabled:opacity-60";

export const blockSecondaryClass =
  "w-full rounded-lg bg-black/[0.06] px-3 py-2 text-sm font-semibold text-foreground hover:bg-black/[0.1] disabled:opacity-60";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="reveal flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display font-medium text-3xl text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted mt-2 max-w-lg leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

const PILL_TONES = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-700",
  gold: "bg-gold/15 text-[#7a5c2e]",
  neutral: "bg-black/[0.05] text-muted",
} as const;

export type PillTone = keyof typeof PILL_TONES;

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${PILL_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const CALLOUT_TONES = {
  danger: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-accent/20 bg-accent/[0.06] text-accent",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
} as const;

export function Callout({
  tone = "info",
  children,
  className = "",
}: {
  tone?: keyof typeof CALLOUT_TONES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 text-sm leading-relaxed ${CALLOUT_TONES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

// Tarjeta de lista con entrada suave y elevación al pasar el cursor.
export function ListCard({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) {
  return (
    <div
      className="reveal rounded-2xl border border-border bg-surface px-5 py-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:-translate-y-px transition"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {children}
    </div>
  );
}
