import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  capsuleDeliveredEmail,
  deathPendingOwnerEmail,
  deathPendingGuardianEmail,
  deathCancelledEmail,
  deathFinalizedGuardianEmail,
} from "@/lib/email-templates";

/** Hours between guardians reaching quorum and capsules actually being
 * delivered — gives the owner a window to cancel a mistaken confirmation. */
export const GRACE_PERIOD_HOURS = 48;

/** Best-effort notification: logs and swallows failures instead of letting
 * one bad address (or Resend's sandbox restrictions) abort a state change
 * that already happened, like starting or cancelling a grace period. */
export async function notify(opts: { to: string; subject: string; html: string }) {
  try {
    await sendEmail(opts);
  } catch (err) {
    console.error(
      `[Akashia] Notificación no enviada a ${opts.to}:`,
      err instanceof Error ? err.message : err
    );
  }
}

export async function deliverCapsule(capsuleId: string) {
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
    include: { owner: true, recipients: true },
  });
  if (!capsule) return;

  for (const recipient of capsule.recipients) {
    if (recipient.delivered) continue;

    try {
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
    } catch (err) {
      console.error(
        `[Akashia] No se pudo entregar la cápsula ${capsuleId} a ${recipient.email}:`,
        err instanceof Error ? err.message : err
      );
      continue; // leave unmarked so the next cron run retries this recipient
    }

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

/**
 * Called once guardian quorum is reached. Instead of delivering immediately,
 * starts a grace period: the owner gets a cancel link, guardians get a
 * heads-up, and nothing is delivered until finalizePendingDeaths() runs
 * after the window closes.
 */
export async function startDeathGracePeriod(ownerId: string) {
  const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerId } });
  const cancelToken = randomUUID();

  await prisma.user.update({
    where: { id: ownerId },
    data: { deceasedPendingAt: new Date(), deceasedCancelToken: cancelToken },
  });

  const cancelUrl = `${process.env.APP_URL || "http://localhost:3000"}/cancel-death/${cancelToken}`;

  await notify({
    to: owner.email,
    subject: "Tus guardianes confirmaron tu fallecimiento — Akashia",
    html: deathPendingOwnerEmail({
      name: owner.name,
      graceHours: GRACE_PERIOD_HOURS,
      cancelUrl,
    }),
  });

  const guardians = await prisma.guardian.findMany({ where: { ownerId } });
  for (const g of guardians) {
    await notify({
      to: g.email,
      subject: `Periodo de espera activo para ${owner.name} — Akashia`,
      html: deathPendingGuardianEmail({
        ownerName: owner.name,
        graceHours: GRACE_PERIOD_HOURS,
      }),
    });
  }
}

/** Owner (or whoever holds the cancel link) calls this off. */
export async function cancelDeathGracePeriod(ownerId: string) {
  const owner = await prisma.user.findUniqueOrThrow({ where: { id: ownerId } });
  if (!owner.deceasedPendingAt) return false;

  await prisma.user.update({
    where: { id: ownerId },
    data: { deceasedPendingAt: null, deceasedCancelToken: null },
  });

  const guardians = await prisma.guardian.findMany({ where: { ownerId } });
  for (const g of guardians) {
    await notify({
      to: g.email,
      subject: `${owner.name} canceló la confirmación — Akashia`,
      html: deathCancelledEmail({ ownerName: owner.name }),
    });
  }
  return true;
}

/** Cron entry point: finalizes any pending death whose grace period has
 * elapsed — marks the owner deceased and delivers their capsules. */
export async function finalizePendingDeaths() {
  const cutoff = new Date(Date.now() - GRACE_PERIOD_HOURS * 60 * 60 * 1000);
  const owners = await prisma.user.findMany({
    where: { deceasedPendingAt: { lte: cutoff }, isDeceased: false },
  });

  for (const owner of owners) {
    await prisma.user.update({
      where: { id: owner.id },
      data: {
        isDeceased: true,
        deceasedPendingAt: null,
        deceasedCancelToken: null,
      },
    });
    await deliverAllDeathCapsules(owner.id);

    const guardians = await prisma.guardian.findMany({
      where: { ownerId: owner.id },
    });
    for (const g of guardians) {
      await notify({
        to: g.email,
        subject: `Se completó la entrega para ${owner.name} — Akashia`,
        html: deathFinalizedGuardianEmail({ ownerName: owner.name }),
      });
    }
  }

  return owners.length;
}
