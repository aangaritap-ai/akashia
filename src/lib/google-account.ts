import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type GoogleIdentity = {
  /** Identificador estable de la persona en Google (`sub`). */
  googleId: string;
  /** Correo ya verificado por Google. */
  email: string;
  name?: string | null;
};

// Una contraseña que nadie conoce: la cuenta entra con Google, y quien quiera
// una propia la crea con "¿La olvidaste?" (que comprueba el correo).
const unusablePassword = () =>
  bcrypt.hash(randomBytes(32).toString("hex"), 10);

/**
 * La cuenta de Akashia de quien entra con Google: la ya vinculada, la que
 * tenga el mismo correo (se vincula) o una nueva. Devuelve `null` si ese
 * correo ya está vinculado a otra cuenta de Google.
 *
 * Al vincular una cuenta existente se anula su contraseña: el registro con
 * contraseña no comprueba el correo, así que pudo crearla otra persona.
 */
export async function accountForGoogle(
  identity: GoogleIdentity,
  db: Prisma.TransactionClient = prisma
) {
  const { googleId } = identity;
  const email = identity.email.trim().toLowerCase();

  const linked = await db.user.findUnique({ where: { googleId } });
  if (linked) {
    return db.user.update({
      where: { id: linked.id },
      data: { lastActiveAt: new Date() },
    });
  }

  const sameEmail =
    (await db.user.findUnique({ where: { email } })) ??
    (await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "asc" },
    }));

  if (sameEmail) {
    if (sameEmail.googleId) return null;
    return db.user.update({
      where: { id: sameEmail.id },
      data: {
        googleId,
        passwordHash: await unusablePassword(),
        lastActiveAt: new Date(),
      },
    });
  }

  return db.user.create({
    data: {
      googleId,
      email,
      name: identity.name?.trim() || email.split("@")[0],
      passwordHash: await unusablePassword(),
    },
  });
}
