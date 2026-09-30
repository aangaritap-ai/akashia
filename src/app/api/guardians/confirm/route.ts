import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { guardianConfirmedNoticeEmail } from "@/lib/email-templates";
import { deliverAllDeathCapsules, requiredConfirmations } from "@/lib/delivery";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Falta el token" }, { status: 400 });
  }

  const guardian = await prisma.guardian.findUnique({
    where: { token },
    include: { confirmation: true, owner: true },
  });
  if (!guardian) {
    return NextResponse.json({ error: "Enlace inválido" }, { status: 404 });
  }
  if (guardian.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Esta invitación no corresponde a tu cuenta" },
      { status: 403 }
    );
  }
  if (guardian.confirmation) {
    return NextResponse.json({ ok: true, alreadyConfirmed: true });
  }

  await prisma.deathConfirmation.create({
    data: { guardianId: guardian.id },
  });

  const allGuardians = await prisma.guardian.findMany({
    where: { ownerId: guardian.ownerId },
    include: { confirmation: true },
  });
  const confirmedCount = allGuardians.filter((g) => g.confirmation).length;
  const needed = requiredConfirmations(allGuardians.length);

  const otherGuardians = allGuardians.filter((g) => g.id !== guardian.id);
  for (const g of otherGuardians) {
    await sendEmail({
      to: g.email,
      subject: `Un guardián confirmó el fallecimiento de ${guardian.owner.name}`,
      html: guardianConfirmedNoticeEmail({
        ownerName: guardian.owner.name,
        guardianName: guardian.name,
      }),
    });
  }

  let triggered = false;
  if (confirmedCount >= needed) {
    await prisma.user.update({
      where: { id: guardian.ownerId },
      data: { isDeceased: true },
    });
    await deliverAllDeathCapsules(guardian.ownerId);
    triggered = true;
  }

  return NextResponse.json({
    ok: true,
    confirmedCount,
    needed,
    triggered,
  });
}
