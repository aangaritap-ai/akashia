import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ locale }) => {
  // Las páginas toman el idioma de la dirección. Las rutas de la API y las
  // acciones del servidor deben indicarlo (ver src/lib/api-locale.ts).
  if (!locale) {
    const segment = await rootLocale();
    if (!hasLocale(routing.locales, segment)) notFound();
    locale = segment;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "America/Bogota",
  };
});
