import { needsAgeCheck } from "@/lib/age";
import { contactSelect, isContactComplete } from "@/lib/contact";
import { prisma } from "@/lib/prisma";

export const readySelect = {
  ...contactSelect,
  createdAt: true,
  ageConfirmedAt: true,
} as const;

/** La cuenta tiene los datos obligatorios y, si le toca, la edad comprobada. */
export function isAccountReady(
  user: Parameters<typeof isContactComplete>[0] &
    Parameters<typeof needsAgeCheck>[0]
) {
  return isContactComplete(user) && !needsAgeCheck(user);
}

/** Para las acciones de la API que se pueden hacer desde páginas públicas. */
export async function readyAccount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: readySelect,
  });
  return user && isAccountReady(user) ? user : null;
}
