import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import TermsEn from "@/content/legal/terms.en";
import TermsEs from "@/content/legal/terms.es";
import type { AppLocale } from "@/i18n/routing";

// Al agregar un idioma, suma aquí su texto.
const CONTENT: Record<AppLocale, ComponentType> = { es: TermsEs, en: TermsEn };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("termsMeta") };
}

export default async function TermsPage() {
  const t = await getTranslations("legal");
  const Content = CONTENT[await getLocale()];

  return (
    <LegalPage title={t("termsTitle")}>
      <Content />
    </LegalPage>
  );
}
