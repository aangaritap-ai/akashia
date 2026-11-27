import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import PrivacyEn from "@/content/legal/privacy.en";
import PrivacyEs from "@/content/legal/privacy.es";
import type { AppLocale } from "@/i18n/routing";

// Al agregar un idioma, suma aquí su texto.
const CONTENT: Record<AppLocale, ComponentType> = { es: PrivacyEs, en: PrivacyEn };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t("privacyMeta") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("legal");
  const Content = CONTENT[await getLocale()];

  return (
    <LegalPage title={t("privacyTitle")}>
      <Content />
    </LegalPage>
  );
}
