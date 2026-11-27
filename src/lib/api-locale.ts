import { cookies, headers } from "next/headers";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";
import type messages from "../../messages/es.json";

// La API no tiene el idioma en la dirección: se toma de la preferencia guardada
// y, si no hay, del navegador.
export async function callerLocale(): Promise<AppLocale> {
  const saved = (await cookies()).get("NEXT_LOCALE")?.value;
  if (hasLocale(routing.locales, saved)) return saved;
  const accepted = (await headers()).get("accept-language") ?? "";
  for (const part of accepted.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (hasLocale(routing.locales, code)) return code;
  }
  return routing.defaultLocale;
}

export type ApiError = keyof (typeof messages)["api"];

/** Mensaje de error de la sección "api", en el idioma de quien llama. */
export async function apiText(key: ApiError, values?: Record<string, string>) {
  const t = await getTranslations({
    locale: await callerLocale(),
    namespace: "api",
  });
  return t(key, values);
}
