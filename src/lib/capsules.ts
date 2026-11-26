import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

/**
 * Por qué no se pueden cambiar ni borrar las cápsulas de una cuenta, o `null`
 * si se puede. Protege los mensajes cuando ya hay una confirmación de
 * fallecimiento: quien tenga acceso a la cuenta no debe poder alterarlos.
 */
export function capsuleLockReason(owner: {
  isDeceased: boolean;
  deceasedPendingAt: Date | null;
}): string | null {
  if (owner.isDeceased) {
    return "Esta cuenta está marcada como fallecida: sus cápsulas ya no se pueden cambiar.";
  }
  if (owner.deceasedPendingAt) {
    return "Hay una confirmación de fallecimiento en curso. Cancélala primero para cambiar tus cápsulas.";
  }
  return null;
}

/**
 * Borra el audio o video de una cápsula que ya nadie usa. La dirección llega
 * desde el navegador, así que solo se borra si está en la carpeta de su dueño.
 */
export async function deleteUnusedCapsuleMedia(
  url: string | null,
  ownerId: string
) {
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return;
    if (!parsed.pathname.startsWith(`/capsules/${ownerId}/`)) return;
    if ((await prisma.capsule.count({ where: { mediaUrl: url } })) > 0) return;
    await del(url);
  } catch (err) {
    // Un archivo huérfano no debe hacer fallar el cambio ya guardado.
    console.error(
      "[Akashia] No se pudo borrar el archivo de una cápsula:",
      err instanceof Error ? err.message : err
    );
  }
}
