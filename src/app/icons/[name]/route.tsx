import { ImageResponse } from "next/og";
import { heartPrintSvg } from "@/components/heartPrint";

// Íconos para instalar la aplicación. "maskable" deja margen porque el
// teléfono recorta las esquinas a su gusto.
const ICONS: Record<string, { size: number; mark: number }> = {
  "192": { size: 192, mark: 140 },
  "512": { size: 512, mark: 374 },
  maskable: { size: 512, mark: 290 },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

export async function GET(
  _req: Request,
  { params }: RouteContext<"/icons/[name]">
) {
  const { name } = await params;
  const icon = ICONS[name];
  if (!icon) return new Response(null, { status: 404 });

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
          clipId: "app",
          ridge: "#faf6ef",
          core: "#d6b27a",
          variant: "detail",
          size: icon.mark,
        })}
      </div>
    ),
    { width: icon.size, height: icon.size }
  );
}
