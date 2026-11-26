// Audio y video de las cápsulas. Se suben directo del navegador al
// almacenamiento, porque no caben en una petición a nuestro servidor.
// Sin dependencias de servidor.

export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;
/** Espacio total de archivos de cápsulas por persona (el plan es compartido). */
export const MEDIA_QUOTA_BYTES = 200 * 1024 * 1024;
export const MEDIA_TOO_BIG = "El archivo no puede pesar más de 50 MB.";

/** Nombre de archivo sin caracteres problemáticos. */
export function safeFileName(name: string) {
  const clean = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^[-.]+/, "");
  return clean.slice(-80) || "archivo";
}

/** ¿Es un archivo de cápsula guardado en la carpeta de esa persona? */
export function isOwnMedia(url: string, ownerId: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".public.blob.vercel-storage.com") &&
      parsed.pathname.startsWith(`/capsules/${ownerId}/`)
    );
  } catch {
    return false;
  }
}
