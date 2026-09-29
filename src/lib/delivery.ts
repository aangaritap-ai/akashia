import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { capsuleDeliveredEmail } from "@/lib/email-templates";

export async function deliverCapsule(capsuleId: string) {
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
    include: { owner: true, recipients: true },
  });
  if (!capsule) return;

  for (const recipient of capsule.recipients) {
    if (recipient.delivered) continue;

    await sendEmail({
      to: recipient.email,
      subject: `Un mensaje de ${capsule.owner.name} para ti — Akashia`,
      html: capsuleDeliveredEmail({
        recipientName: recipient.name,
        senderName: capsule.owner.name,
        title: capsule.title,
        textContent: capsule.textContent,
        mediaUrl: capsule.mediaUrl,
        mediaType:
          capsule.type === "AUDIO" || capsule.type === "VIDEO"
            ? capsule.type
            : null,
      }),
    });

    await prisma.capsuleRecipient.update({
      where: { id: recipient.id },
      data: { delivered: true, deliveredAt: new Date() },
    });
  }
}

/** Guardianes requeridos para confirmar un fallecimiento: 1 si solo hay un guardián, 2 en cualquier otro caso. */
export function requiredConfirmations(totalGuardians: number) {
  if (totalGuardians <= 1) return 1;
  return 2;
}

export async function deliverAllDeathCapsules(ownerId: string) {
  const capsules = await prisma.capsule.findMany({
    where: {
      ownerId,
      triggerType: "DEATH",
      recipients: { some: { delivered: false } },
    },
    select: { id: true },
  });
  for (const c of capsules) {
    await deliverCapsule(c.id);
  }
}
