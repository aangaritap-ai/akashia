import { uploadPresigned } from "@vercel/blob/client";
import { MAX_MEDIA_BYTES, MEDIA_TOO_BIG, safeFileName } from "@/lib/media";

/** Sube desde el navegador el audio o video de una cápsula. */
export async function uploadCapsuleMedia(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<string> {
  if (file.size > MAX_MEDIA_BYTES) throw new Error(MEDIA_TOO_BIG);

  const session = await fetch("/api/auth/session").then((r) => r.json());
  const userId = session?.user?.id;
  if (!userId) throw new Error("Tu sesión terminó. Vuelve a entrar.");

  // La librería no entrega el motivo cuando el servidor rechaza la subida,
  // así que se consulta antes.
  const check = await fetch("/api/upload/presign");
  const info = await check.json().catch(() => ({}));
  if (!check.ok) throw new Error(info.error || "No se puede subir el archivo");
  if (file.size > info.available) {
    throw new Error(
      "No te queda espacio para este archivo. Borra alguna cápsula con audio o video."
    );
  }

  const blob = await uploadPresigned(
    `capsules/${userId}/${safeFileName(file.name)}`,
    file,
    {
      access: "public",
      handleUploadUrl: "/api/upload/presign",
      contentType: file.type || undefined,
      onUploadProgress: (e) => onProgress?.(Math.round(e.percentage)),
    }
  );
  return blob.url;
}
