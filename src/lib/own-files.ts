import { del } from "@vercel/blob";
import { isStorageUrl } from "@/lib/uploads";

/**
 * Las direcciones que de verdad son archivos de esa persona: están en nuestro
 * almacenamiento y en una de sus carpetas. Las direcciones guardadas pudieron
 * llegar desde el navegador, así que no basta con confiar en ellas.
 */
export function filesOwnedBy(
  ownerId: string,
  urls: (string | null | undefined)[]
): string[] {
  const folders = ["avatars", "stories", "capsules"].map(
    (name) => `/${name}/${ownerId}/`
  );
  const own = urls.filter(
    (url): url is string =>
      typeof url === "string" &&
      isStorageUrl(url) &&
      folders.some((folder) => new URL(url).pathname.startsWith(folder))
  );
  return [...new Set(own)];
}

/** Borra archivos sin hacer fallar lo que ya se guardó. */
export async function deleteFiles(urls: string[]) {
  if (urls.length === 0) return;
  try {
    await del(urls);
  } catch (err) {
    console.error(
      "[Akashia] No se pudieron borrar archivos:",
      err instanceof Error ? err.message : err
    );
  }
}
