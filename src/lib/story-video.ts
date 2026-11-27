import { isStorageUrl } from "@/lib/uploads";

// Videos de las historias. Los límites son bajos a propósito: el espacio y la
// descarga del almacenamiento son compartidos por todos. Sin dependencias de
// servidor: el formulario avisa antes de subir y el servidor vuelve a validar.
export const MAX_STORY_VIDEO_BYTES = 15 * 1024 * 1024;
export const MAX_STORY_VIDEO_SECONDS = 30;
/** Videos sin vencer que puede tener una persona a la vez. */
export const MAX_ACTIVE_VIDEOS = 3;
export const STORY_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/** ¿Es un video de historia guardado en la carpeta de esa persona? */
export function isOwnStoryVideo(url: string, ownerId: string) {
  if (!isStorageUrl(url)) return false;
  const { pathname } = new URL(url);
  return (
    pathname.startsWith(`/stories/${ownerId}/`) &&
    /\.(mp4|webm|mov)$/.test(pathname)
  );
}
