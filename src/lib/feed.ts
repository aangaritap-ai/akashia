import { prisma } from "@/lib/prisma";

/** A quién va dirigido un mensaje del feed: una mascota o una persona. */
export function messageTarget(m: {
  owner: { id: string; name: string };
  pet: { id: string; name: string } | null;
}) {
  return m.pet
    ? { href: `/huellitas/${m.pet.id}`, name: m.pet.name, isPet: true }
    : { href: `/memorial/${m.owner.id}`, name: m.owner.name, isPet: false };
}

/** Mensajes públicos de la comunidad, del más reciente al más antiguo. */
export function publicMessages(take: number) {
  return prisma.memorialMessage.findMany({
    where: { isPublic: true },
    include: {
      owner: { select: { id: true, name: true } },
      pet: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}
