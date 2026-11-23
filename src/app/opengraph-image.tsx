import { ImageResponse } from "next/og";

export const alt = "Akashia — Deja tu huella en quienes amas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <svg width="150" height="150" viewBox="0 0 48 48" fill="none">
          <path
            d="M10 41V22a14 14 0 0 1 28 0v19"
            stroke="#1b3a5c"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 41V23a7 7 0 0 1 14 0v18"
            stroke="#b8935a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
          <circle cx="24" cy="26" r="3.4" fill="#b8935a" />
        </svg>
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
          Deja mensajes para las personas que amas, entregados en el momento
          que elijas.
        </div>
      </div>
    ),
    { ...size }
  );
}
