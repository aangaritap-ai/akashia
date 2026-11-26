import type { MetadataRoute } from "next";

// Permite instalar Akashia en la pantalla del celular como una aplicación.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Akashia",
    short_name: "Akashia",
    description: "Deja tu huella en quienes amas.",
    lang: "es",
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
