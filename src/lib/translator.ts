import { createTranslator, hasLocale } from "next-intl";
import { routing, type AppLocale } from "@/i18n/routing";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

// Textos para lo que se genera sin una persona mirando: correos y avisos que se
// guardan. Al agregar un idioma, importa aquí su archivo.
const MESSAGES: Record<AppLocale, typeof es> = { es, en };

/** Convierte lo guardado en un idioma válido (o el principal). */
export function toLocale(value: string | null | undefined): AppLocale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

/** Los textos de una sección en un idioma. */
export function textsFor<
  Namespace extends "email" | "saved" | "dates",
>(locale: AppLocale, namespace: Namespace) {
  return createTranslator({ locale, messages: MESSAGES[locale], namespace });
}

/** Dirección completa de una página en un idioma, para los enlaces de correo. */
export function pageUrl(path: string, locale: AppLocale) {
  const base = process.env.APP_URL || "http://localhost:3000";
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return base + prefix + path;
}
