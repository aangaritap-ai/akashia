"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_NAMES, routing, type AppLocale } from "@/i18n/routing";

// Cambia el idioma sin salir de la página. "compact" muestra solo el código
// (ES, EN) para el encabezado.
export default function LanguageSwitcher({
  compact = false,
  remember = false,
}: {
  compact?: boolean;
  // Con sesión: guarda la elección en la cuenta, para los correos.
  remember?: boolean;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const t = useTranslations("language");

  function change(next: AppLocale) {
    // Conserva lo que venga después del signo de pregunta.
    const query = window.location.search;
    if (remember) {
      // Si falla, la página cambia igual; solo no queda guardado.
      void fetch("/api/profile/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
        keepalive: true,
      }).catch(() => {});
    }
    startTransition(() => router.replace(pathname + query, { locale: next }));
  }

  return (
    <select
      value={locale}
      disabled={pending}
      onChange={(e) => change(e.target.value as AppLocale)}
      aria-label={t("label")}
      className="cursor-pointer rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground disabled:opacity-60"
    >
      {routing.locales.map((code) => (
        <option key={code} value={code}>
          {compact ? code.toUpperCase() : LOCALE_NAMES[code]}
        </option>
      ))}
    </select>
  );
}
