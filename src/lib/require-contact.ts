import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { localizedPath } from "@/i18n/navigation";
import { isAccountReady, readySelect } from "@/lib/account-ready";
import { prisma } from "@/lib/prisma";

/**
 * Para las secciones con sesión: sin los datos obligatorios o sin la edad
 * comprobada se va a completarlos; y una cuenta ya eliminada, a entrar de nuevo.
 */
export async function requireContact(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: readySelect,
  });
  const locale = await getLocale();
  if (!user) redirect(localizedPath("/login", locale));
  if (!isAccountReady(user)) {
    redirect(localizedPath("/completar-datos", locale));
  }
}
