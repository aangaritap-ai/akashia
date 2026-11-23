import { ImageResponse } from "next/og";

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
        <svg width="112" height="112" viewBox="0 0 48 48" fill="none">
          <path
            d="M10 41V22a14 14 0 0 1 28 0v19"
            stroke="#faf6ef"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="27" r="3.8" fill="#d6b27a" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
