import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { localizedPath } from "@/i18n/navigation";
import { contactSelect, isContactComplete } from "@/lib/contact";
import { prisma } from "@/lib/prisma";

/**
 * Para las secciones con sesión: sin los datos obligatorios se va a
 * completarlos; y una cuenta ya eliminada, a entrar de nuevo.
 */
export async function requireContact(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: contactSelect,
  });
  const locale = await getLocale();
  if (!user) redirect(localizedPath("/login", locale));
  if (!isContactComplete(user)) {
    redirect(localizedPath("/completar-datos", locale));
  }
}
