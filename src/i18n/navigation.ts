import { hasLocale } from "next-intl";
import { createNavigation } from "next-intl/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

// Enlaces y navegación que conservan el idioma en la dirección. Úsalos en lugar
// de next/link y de los hooks de next/navigation.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

/** Ruta con el prefijo del idioma, para las redirecciones desde el servidor.
 * Si ya lo trae, se deja igual. */
export function localizedPath(href: string, locale: AppLocale) {
  const first = href.split(/[/?#]/)[1];
  return hasLocale(routing.locales, first)
    ? href
    : getPathname({ href, locale });
}
