"use client";

import "./globals.css";

// Último recurso, cuando falla el propio marco de la aplicación. Reemplaza toda
// la página, por eso trae sus propias etiquetas y sus propios textos.
const TEXTS = {
  es: {
    title: "No pudimos cargar Akashia",
    body: "Suele ser algo momentáneo. Espera unos segundos e inténtalo de nuevo.",
    retry: "Reintentar",
  },
  en: {
    title: "We couldn't load Akashia",
    body: "This is usually temporary. Wait a few seconds and try again.",
    retry: "Try again",
  },
};

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const english =
    typeof window !== "undefined" &&
    /^\/en(\/|$)/.test(window.location.pathname);
  const lang = english ? "en" : "es";
  const text = TEXTS[lang];

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-background text-foreground">
        <h1 className="text-2xl font-semibold">{text.title}</h1>
        <p className="max-w-sm text-muted leading-relaxed">{text.body}</p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          {text.retry}
        </button>
      </body>
    </html>
  );
}
