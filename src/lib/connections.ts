import { prisma } from "@/lib/prisma";

// "Seguir con aprobación", de un solo sentido. En la tabla Connection:
//   requesterId = quien sigue (o pide seguir)
//   addresseeId = a quien se sigue, que aprueba o rechaza
// Que A siga a B no significa que B siga a A.

/** Máximo de solicitudes enviadas pendientes por persona (evita spam). */
export const MAX_PENDING_SENT = 50;

/** IDs de las personas a las que `userId` sigue (ya aprobado). */
export async function getFollowingIds(userId: string): Promise<string[]> {
  const rows = await prisma.connection.findMany({
    where: { requesterId: userId, status: "ACCEPTED" },
    select: { addresseeId: true },
  });
  return rows.map((r) => r.addresseeId);
}

/** ¿`followerId` sigue a `followedId`, con aprobación? */
export async function isFollowing(
  followerId: string,
  followedId: string
): Promise<boolean> {
  const row = await prisma.connection.findFirst({
    where: {
      requesterId: followerId,
      addresseeId: followedId,
      status: "ACCEPTED",
    },
    select: { id: true },
  });
  return row !== null;
}

/** Solicitudes para seguirme que aún no he respondido. */
export function pendingReceivedCount(userId: string) {
  return prisma.connection.count({
    where: { addresseeId: userId, status: "PENDING" },
  });
}

/** Mi relación hacia otra persona: no la sigo, pedí seguirla, o la sigo. */
export type FollowState = "none" | "sent" | "following";

export type Follow = { state: FollowState; connectionId: string | null };

export function followFromRow(
  row: { id: string; status: string } | null
): Follow {
  if (!row) return { state: "none", connectionId: null };
  return {
    state: row.status === "ACCEPTED" ? "following" : "sent",
    connectionId: row.id,
  };
}

/** Mi relación hacia `other`, vista desde `me`. */
export async function followBetween(
  me: string,
  other: string
): Promise<Follow> {
  const row = await prisma.connection.findFirst({
    where: { requesterId: me, addresseeId: other },
    select: { id: true, status: true },
  });
  return followFromRow(row);
}
