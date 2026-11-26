import type { NotificationType, Prisma } from "@prisma/client";
import { mutualsWith, type Mutuals, type Person } from "@/lib/connections";
import { shortAgo } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export type NotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  linkUrl: string | null;
  read: boolean;
  /** Hace cuánto llegó, en corto: "2 h", "1 día". */
  ago: string;
  /** Llegó en las últimas 24 horas (sección "Nuevas"). */
  recent: boolean;
  actor: Person | null;
  /** Solo en solicitudes de seguimiento: si aún espera respuesta. */
  request: { connectionId: string; mutuals: Mutuals } | null;
  accepted: boolean;
};

const DAY = 86_400_000;

/** Los avisos de una persona, listos para mostrar. */
export async function listNotifications(
  userId: string,
  take = 30,
  db: Prisma.TransactionClient = prisma
): Promise<NotificationView[]> {
  const rows = await db.notification.findMany({
    where: { userId },
    include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });

  const askers = rows.flatMap((n) =>
    n.type === "CONNECTION_REQUEST" && n.actorId ? [n.actorId] : []
  );
  const connections = askers.length
    ? await db.connection.findMany({
        where: { addresseeId: userId, requesterId: { in: askers } },
        select: { id: true, requesterId: true, status: true },
      })
    : [];
  const mutuals = await mutualsWith(
    userId,
    connections.filter((c) => c.status === "PENDING").map((c) => c.requesterId),
    db
  );

  // Los botones van solo en el aviso más nuevo de cada solicitud.
  const used = new Set<string>();
  const now = Date.now();

  return rows.map((n) => {
    const connection =
      n.type === "CONNECTION_REQUEST" && n.actorId && !used.has(n.actorId)
        ? connections.find((c) => c.requesterId === n.actorId)
        : undefined;
    if (connection) used.add(connection.requesterId);
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      linkUrl: n.linkUrl,
      read: n.read,
      ago: shortAgo(n.createdAt, now),
      recent: now - n.createdAt.getTime() < DAY,
      actor: n.actor,
      request:
        connection?.status === "PENDING"
          ? {
              connectionId: connection.id,
              mutuals: mutuals.get(connection.requesterId) ?? {
                count: 0,
                sample: [],
              },
            }
          : null,
      accepted: connection?.status === "ACCEPTED",
    };
  });
}

export async function notifyGuardianInvite(opts: {
  guardianEmail: string;
  guardianToken: string;
  ownerId: string;
  ownerName: string;
}) {
  const account = await prisma.user.findUnique({
    where: { email: opts.guardianEmail.toLowerCase() },
    select: { id: true },
  });
  if (!account) return false;

  await prisma.notification.create({
    data: {
      userId: account.id,
      actorId: opts.ownerId,
      type: "GUARDIAN_INVITE",
      title: "Te invitaron a ser guardián",
      body: `${opts.ownerName} te designó como guardián en Akashia.`,
      linkUrl: `/guardian/${opts.guardianToken}`,
    },
  });
  return true;
}

export async function notifyFollowRequest(opts: {
  toUserId: string;
  fromId: string;
  fromName: string;
}) {
  await prisma.notification.create({
    data: {
      userId: opts.toUserId,
      actorId: opts.fromId,
      type: "CONNECTION_REQUEST",
      title: "Quieren seguirte",
      body: `${opts.fromName} quiere seguirte en Akashia.`,
      linkUrl: "/dashboard/connections",
    },
  });
}

export async function notifyFollowAccepted(opts: {
  toUserId: string;
  fromId: string;
  fromName: string;
}) {
  await prisma.notification.create({
    data: {
      userId: opts.toUserId,
      actorId: opts.fromId,
      type: "CONNECTION_ACCEPTED",
      title: "Solicitud aceptada",
      body: `${opts.fromName} aceptó tu solicitud. Ya puedes ver sus historias.`,
      linkUrl: "/inicio",
    },
  });
}
