"use client";

import Link from "next/link";
import { primaryButtonClass } from "@/components/ui";

// Algo falló al preparar la página. Casi siempre es pasajero (por ejemplo, la
// base de datos despertando), así que se ofrece reintentar.
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="font-display font-medium text-3xl text-foreground">
        No pudimos cargar esta página
      </h1>
      <p className="max-w-sm text-muted leading-relaxed">
        Suele ser algo momentáneo. Espera unos segundos e inténtalo de nuevo.
      </p>
      <button type="button" onClick={() => retry()} className={primaryButtonClass}>
        Reintentar
      </button>
      <Link href="/" className="text-sm text-accent hover:underline">
        Ir al inicio
      </Link>
    </main>
  );
}
