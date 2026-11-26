import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { primaryButtonClass } from "@/components/ui";

export const metadata: Metadata = { title: "No encontramos esa página — Akashia" };

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <LogoMark className="w-20 h-20" variant="detail" />
      <h1 className="font-display font-medium text-3xl text-foreground">
        No encontramos esa página
      </h1>
      <p className="max-w-sm text-muted leading-relaxed">
        Puede que el enlace esté incompleto o que lo que buscas ya no exista.
      </p>
      <Link href="/" className={primaryButtonClass}>
        Ir al inicio
      </Link>
    </main>
  );
}
