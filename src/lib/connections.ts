import { prisma } from "@/lib/prisma";

/** Máximo de solicitudes enviadas pendientes por persona (evita spam). */
export const MAX_PENDING_SENT = 50;

/** IDs de las personas conectadas (aceptadas) con el usuario, sin importar
 * quién envió la solicitud. */
export async function getConnectionIds(userId: string): Promise<string[]> {
  const rows = await prisma.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) =>
    r.requesterId === userId ? r.addresseeId : r.requesterId
  );
}

export async function areConnected(a: string, b: string): Promise<boolean> {
  if (a === b) return true;
  const row = await prisma.connection.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
    select: { id: true },
  });
  return row !== null;
}

/** Solicitudes recibidas que aún no se han respondido. */
export function pendingReceivedCount(userId: string) {
  return prisma.connection.count({
    where: { addresseeId: userId, status: "PENDING" },
  });
}

export type RelationState = "none" | "connected" | "sent" | "received";

export type Relation = { state: RelationState; connectionId: string | null };

/** Relación entre `me` y `other`, vista desde `me`. */
export async function relationBetween(
  me: string,
  other: string
): Promise<Relation> {
  const row = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: me, addresseeId: other },
        { requesterId: other, addresseeId: me },
      ],
    },
    select: { id: true, status: true, requesterId: true },
  });
  return relationFromRow(row, me);
}

export function relationFromRow(
  row: { id: string; status: string; requesterId: string } | null,
  me: string
): Relation {
  if (!row) return { state: "none", connectionId: null };
  if (row.status === "ACCEPTED") {
    return { state: "connected", connectionId: row.id };
  }
  return {
    state: row.requesterId === me ? "sent" : "received",
    connectionId: row.id,
  };
}
