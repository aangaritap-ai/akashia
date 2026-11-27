import { defineRouting } from "next-intl/routing";

// Idiomas de Akashia. El principal (es) no lleva prefijo en la dirección; los
// demás sí (akashia.app/en/…). Para agregar uno: crea messages/<código>.json,
// súmalo aquí y a LOCALE_NAMES, y ejecuta "npm run idiomas".
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  // La elección del selector se recuerda un año.
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});

export type AppLocale = (typeof routing.locales)[number];

/** Cómo se llama cada idioma en su propio idioma. */
export const LOCALE_NAMES: Record<AppLocale, string> = {
  es: "Español",
  en: "English",
};
