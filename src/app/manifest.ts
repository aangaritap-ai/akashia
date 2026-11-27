import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";
import { callerLocale } from "@/lib/api-locale";

// Permite instalar Akashia en la pantalla del celular como una aplicación.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await callerLocale();
  const t = await getTranslations({ locale, namespace: "share" });
  return {
    name: "Akashia",
    short_name: "Akashia",
    description: t("appDescription"),
    lang: locale,
    start_url: "/inicio",
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#faf6ef",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
