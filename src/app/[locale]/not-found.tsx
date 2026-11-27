import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LogoMark } from "@/components/Logo";
import { primaryButtonClass } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("notFound") };
}

export default function NotFound() {
  const t = useTranslations("notFoundPage");
  const common = useTranslations("common");

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <LogoMark className="w-20 h-20" variant="detail" />
      <h1 className="font-display font-medium text-3xl text-foreground">
        {t("title")}
      </h1>
      <p className="max-w-sm text-muted leading-relaxed">
        {t("body")}
      </p>
      <Link href="/" className={primaryButtonClass}>
        {common("goHome")}
      </Link>
    </main>
  );
}
