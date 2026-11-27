import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { filesOwnedBy } from "@/lib/own-files";
import { isStorageUrl } from "@/lib/uploads";

/**
 * Elimina una cuenta con todo lo suyo. Devuelve los archivos que hay que
 * borrar después, o el motivo por el que no se puede.
 *
 * No se eliminan los audios y videos de cápsulas que ya llegaron a alguien:
 * esa persona los recibió y su enlace debe seguir funcionando.
 */
export async function removeAccount(
  userId: string,
  db: Prisma.TransactionClient = prisma
): Promise<{ files: string[] } | { error: "gone" | "pendingDeath" }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      capsules: { include: { recipients: true } },
      stories: { select: { imageUrl: true } },
      pets: { select: { photoUrl: true } },
      memorialMessages: { select: { imageUrl: true } },
      guardianRoles: {
        include: {
          owner: {
            select: { id: true, isDeceased: true, deceasedPendingAt: true },
          },
        },
      },
    },
  });
  if (!user) return { error: "gone" };
  if (user.isDeceased || user.deceasedPendingAt) {
    return { error: "pendingDeath" };
  }

  const files = filesOwnedBy(userId, [
    user.avatarUrl,
    user.coverUrl,
    ...user.stories.map((s) => s.imageUrl),
    ...user.pets.map((p) => p.photoUrl),
    ...user.capsules
      .filter((c) => !c.recipients.some((r) => r.delivered))
      .map((c) => c.mediaUrl),
  ]);
  // Fotos de los mensajes que había en sus páginas.
  for (const { imageUrl } of user.memorialMessages) {
    if (
      imageUrl &&
      isStorageUrl(imageUrl) &&
      new URL(imageUrl).pathname.startsWith("/memorial/")
    ) {
      files.push(imageUrl);
    }
  }

  // Donde era guardián, la invitación queda pendiente y se avisa: se necesita
  // otra persona. La fila no se borra para no reducir las confirmaciones que
  // se exigen.
  for (const role of user.guardianRoles) {
    if (role.ownerId === userId) continue;
    const quiet = !role.owner.isDeceased && !role.owner.deceasedPendingAt;
    if (quiet) {
      await db.deathConfirmation.deleteMany({
        where: { guardianId: role.id },
      });
    }
    await db.guardian.update({
      where: { id: role.id },
      data: { userId: null, status: "PENDING" },
    });
    await db.notification.create({
      data: {
        userId: role.ownerId,
        type: "GUARDIAN_INVITE",
        title: "Un guardián cerró su cuenta",
        body: `${user.name} ya no puede ser tu guardián. Invita a otra persona.`,
        linkUrl: "/dashboard/guardians",
      },
    });
  }

  await db.user.delete({ where: { id: userId } });
  return { files };
}
