import { ImageResponse } from "next/og";
import { heartPrintSvg } from "@/components/heartPrint";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1b3a5c",
          borderRadius: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {heartPrintSvg({
          clipId: "ic",
          ridge: "#faf6ef",
          core: "#d6b27a",
          variant: "simple",
          size: 46,
        })}
      </div>
    ),
    { ...size }
  );
}
