import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/translator";
import type { AppLocale } from "@/i18n/routing";

/**
 * En qué idioma escribirle a un correo: el de su cuenta si tiene una; si no, el
 * que eligió quien lo registró.
 */
export async function localeForEmail(
  email: string,
  chosen: string | null | undefined,
  db: Prisma.TransactionClient = prisma
): Promise<AppLocale> {
  const account = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { locale: true },
  });
  return toLocale(account?.locale ?? chosen);
}
