import { useId } from "react";
import { heartPrintSvg, type HeartPrintVariant } from "@/components/heartPrint";

type MarkProps = {
  className?: string;
  // "detail" para tamaños grandes (landing), "simple" para pequeños (encabezado).
  variant?: HeartPrintVariant;
};

// Una huella dactilar con forma de corazón: cada persona deja una huella única.
export function LogoMark({ className = "w-8 h-8", variant = "simple" }: MarkProps) {
  const clipId = `hp${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return heartPrintSvg({
    clipId,
    ridge: "var(--accent)",
    core: "var(--gold)",
    variant,
    className,
  });
}

export function Logo({
  className = "",
  markClassName = "w-8 h-8",
  variant = "simple",
}: {
  className?: string;
  markClassName?: string;
  variant?: HeartPrintVariant;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} variant={variant} />
      <span className="font-display text-xl tracking-tight">Akashia</span>
    </span>
  );
}
