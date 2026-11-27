import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { heartPrintSvg } from "@/components/heartPrint";

export const alt = "Akashia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const requested = (await params).locale;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale,
    namespace: "share",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#faf6ef",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            left: 300,
            width: 600,
            height: 600,
            borderRadius: 600,
            background: "rgba(184,147,90,0.18)",
          }}
        />
        {heartPrintSvg({
          clipId: "og",
          ridge: "#1b3a5c",
          core: "#b8935a",
          variant: "detail",
          size: 230,
        })}
        <div
          style={{
            fontSize: 112,
            color: "#221d16",
            letterSpacing: -2,
            fontWeight: 600,
          }}
        >
          Akashia
        </div>
        <div
          style={{
            fontSize: 38,
            color: "#6b6152",
            maxWidth: 820,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {t("imageText")}
        </div>
      </div>
    ),
    { ...size }
  );
}
