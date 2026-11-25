import { prisma } from "@/lib/prisma";

/** Mensajes públicos de la comunidad, del más reciente al más antiguo. */
export function publicMessages(take: number) {
  return prisma.memorialMessage.findMany({
    where: { isPublic: true },
    include: { owner: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}
