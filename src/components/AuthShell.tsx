import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/Logo";

// Marco común de las pantallas de acceso: logo, título y una tarjeta.
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative flex-1 flex items-center justify-center px-6 py-14 overflow-hidden">
      <div
        aria-hidden="true"
        className="glow-pulse pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full bg-gold/20 blur-3xl"
      />
      <div className="relative w-full max-w-sm flex flex-col gap-6">
        <div className="reveal flex flex-col items-center text-center gap-3">
          <Link href="/" aria-label="Akashia, inicio">
            <LogoMark className="w-16 h-16" variant="detail" />
          </Link>
          <h1 className="font-display font-medium text-3xl text-foreground">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>

        <div
          className="reveal rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col gap-5"
          style={{ animationDelay: "80ms" }}
        >
          {children}
        </div>

        {footer && (
          <div
            className="reveal text-center text-sm text-muted flex flex-col gap-2"
            style={{ animationDelay: "160ms" }}
          >
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}
