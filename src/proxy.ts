import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Elige el idioma de cada página según la dirección, la preferencia guardada o
// el navegador.
export default createMiddleware(routing);

export const config = {
  // Todo menos la API, los archivos de Next.js, los iconos y cualquier archivo.
  matcher:
    // La doble barra es necesaria: "\\." es un punto, y "." sería cualquier letra.
    "/((?!api(?:/|$)|_next|_vercel|icons(?:/|$)|icon|apple-icon|.*opengraph-image|.*\\..*).*)",
};
