import type { Metadata, Viewport } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://akashia.app"),
  title: "Akashia — Deja tu huella",
  description:
    "Deja mensajes para las personas que amas, entregados en el momento que tú elijas.",
  openGraph: {
    title: "Akashia — Deja tu huella",
    description:
      "Deja mensajes para las personas que amas, entregados en el momento que tú elijas.",
    siteName: "Akashia",
    locale: "es",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf6ef",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
