import { prisma } from "@/lib/prisma";

export async function notifyGuardianInvite(opts: {
  guardianEmail: string;
  guardianToken: string;
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
      type: "GUARDIAN_INVITE",
      title: "Te invitaron a ser guardián",
      body: `${opts.ownerName} te designó como guardián en Akashia.`,
      linkUrl: `/guardian/${opts.guardianToken}`,
    },
  });
  return true;
}

export async function notifyConnectionRequest(opts: {
  toUserId: string;
  fromName: string;
}) {
  await prisma.notification.create({
    data: {
      userId: opts.toUserId,
      type: "CONNECTION_REQUEST",
      title: "Nueva solicitud de conexión",
      body: `${opts.fromName} quiere conectar contigo en Akashia.`,
      linkUrl: "/dashboard/connections",
    },
  });
}

export async function notifyConnectionAccepted(opts: {
  toUserId: string;
  fromName: string;
}) {
  await prisma.notification.create({
    data: {
      userId: opts.toUserId,
      type: "CONNECTION_ACCEPTED",
      title: "Solicitud aceptada",
      body: `${opts.fromName} aceptó tu solicitud. Ya están conectados.`,
      linkUrl: "/dashboard/connections",
    },
  });
}
