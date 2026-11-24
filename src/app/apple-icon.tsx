import { ImageResponse } from "next/og";
import { heartPrintSvg } from "@/components/heartPrint";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1b3a5c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {heartPrintSvg({
          clipId: "ai",
          ridge: "#faf6ef",
          core: "#d6b27a",
          variant: "detail",
          size: 128,
        })}
      </div>
    ),
    { ...size }
  );
}
