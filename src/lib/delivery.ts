import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { capsuleDeliveredEmail } from "@/lib/email-templates";

export async function deliverCapsule(capsuleId: string) {
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
    include: { owner: true },
  });
  if (!capsule || capsule.delivered) return;

  await sendEmail({
    to: capsule.recipientEmail,
    subject: `Un mensaje de ${capsule.owner.name} para ti — Akashia`,
    html: capsuleDeliveredEmail({
      recipientName: capsule.recipientName,
      senderName: capsule.owner.name,
      title: capsule.title,
      textContent: capsule.textContent,
      mediaUrl: capsule.mediaUrl,
      mediaType: capsule.type === "AUDIO" || capsule.type === "VIDEO" ? capsule.type : null,
    }),
  });

  await prisma.capsule.update({
    where: { id: capsuleId },
    data: { delivered: true, deliveredAt: new Date() },
  });
}

/** Guardianes requeridos para confirmar un fallecimiento: 1 si solo hay un guardián, 2 en cualquier otro caso. */
export function requiredConfirmations(totalGuardians: number) {
  if (totalGuardians <= 1) return 1;
  return 2;
}

export async function deliverAllDeathCapsules(ownerId: string) {
  const capsules = await prisma.capsule.findMany({
    where: { ownerId, triggerType: "DEATH", delivered: false },
  });
  for (const c of capsules) {
    await deliverCapsule(c.id);
  }
}
