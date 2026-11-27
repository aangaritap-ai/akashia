"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { primaryButtonClass } from "@/components/ui";

// Algo falló al preparar la página. Casi siempre es pasajero (por ejemplo, la
// base de datos despertando), así que se ofrece reintentar.
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("errorPage");
  const common = useTranslations("common");

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="font-display font-medium text-3xl text-foreground">
        {t("title")}
      </h1>
      <p className="max-w-sm text-muted leading-relaxed">
        {t("body")}
      </p>
      <button type="button" onClick={() => retry()} className={primaryButtonClass}>
        {common("retry")}
      </button>
      <Link href="/" className="text-sm text-accent hover:underline">
        {common("goHome")}
      </Link>
    </main>
  );
}
