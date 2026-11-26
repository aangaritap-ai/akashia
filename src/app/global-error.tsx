"use client";

import "./globals.css";

// Último recurso, cuando falla el propio marco de la aplicación. Reemplaza toda
// la página, por eso trae sus propias etiquetas html y body.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-background text-foreground">
        <h1 className="text-2xl font-semibold">No pudimos cargar Akashia</h1>
        <p className="max-w-sm text-muted leading-relaxed">
          Suele ser algo momentáneo. Espera unos segundos e inténtalo de nuevo.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
