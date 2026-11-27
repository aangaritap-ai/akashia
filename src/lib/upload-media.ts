import { uploadPresigned } from "@vercel/blob/client";
import { MAX_MEDIA_BYTES, safeFileName } from "@/lib/media";

/** Los textos de la sección "capsules" que puede necesitar la subida. */
type UploadText = (
  key: "tooBig" | "sessionEnded" | "cannotUpload" | "noSpace"
) => string;

/** Sube desde el navegador el audio o video de una cápsula. */
export async function uploadCapsuleMedia(
  file: File,
  t: UploadText,
  onProgress?: (percentage: number) => void
): Promise<string> {
  if (file.size > MAX_MEDIA_BYTES) throw new Error(t("tooBig"));

  const session = await fetch("/api/auth/session").then((r) => r.json());
  const userId = session?.user?.id;
  if (!userId) throw new Error(t("sessionEnded"));

  // La librería no entrega el motivo cuando el servidor rechaza la subida,
  // así que se consulta antes.
  const check = await fetch("/api/upload/presign");
  const info = await check.json().catch(() => ({}));
  if (!check.ok) throw new Error(info.error || t("cannotUpload"));
  if (file.size > info.available) {
    throw new Error(t("noSpace"));
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
