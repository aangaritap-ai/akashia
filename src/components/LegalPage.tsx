import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { LEGAL } from "@/lib/legal";

// Marco de las páginas de texto legal.
export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const t = useTranslations("legal");
  const updated = new Date(`${LEGAL.updated}T00:00:00Z`).toLocaleDateString(
    useLocale(),
    { dateStyle: "long", timeZone: "UTC" }
  );

  return (
    <main className="flex-1 px-6 py-12">
      <article className="mx-auto w-full max-w-2xl flex flex-col gap-4 text-[15px] leading-relaxed text-foreground [&_h2]:font-display [&_h2]:font-medium [&_h2]:text-xl [&_h2]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_a]:text-accent [&_a]:underline">
        <h1 className="font-display font-medium text-4xl">{title}</h1>
        <p className="text-sm text-muted">
          {t("updated", { date: updated })}
        </p>
        {children}
        <p className="mt-6 border-t border-border pt-4 text-sm text-muted">
          <Link href="/privacidad">{t("privacyTitle")}</Link> ·{" "}
          <Link href="/terminos">{t("termsTitle")}</Link> ·{" "}
          <Link href="/">{t("home")}</Link>
        </p>
      </article>
    </main>
  );
}
