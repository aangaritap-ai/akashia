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
