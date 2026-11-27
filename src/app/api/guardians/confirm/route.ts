import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guardianConfirmedNoticeEmail } from "@/lib/email-templates";
import {
  requiredConfirmations,
  startDeathGracePeriod,
  GRACE_PERIOD_HOURS,
  notify,
} from "@/lib/delivery";
import { apiText } from "@/lib/api-locale";
import { localeForEmail } from "@/lib/user-locale";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: await apiText("missingToken") }, { status: 400 });
  }

  const guardian = await prisma.guardian.findUnique({
    where: { token },
    include: { confirmation: true, owner: true },
  });
  if (!guardian) {
    return NextResponse.json({ error: await apiText("invalidLink") }, { status: 404 });
  }
  if (guardian.userId !== session.user.id) {
    return NextResponse.json(
      { error: await apiText("inviteNotYours") },
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
    await notify({
      to: g.email,
      ...guardianConfirmedNoticeEmail({
        locale: await localeForEmail(g.email, g.locale),
        ownerName: guardian.owner.name,
        guardianName: guardian.name,
      }),
    });
  }

  let pending = false;
  if (confirmedCount >= needed) {
    await startDeathGracePeriod(guardian.ownerId);
    pending = true;
  }

  return NextResponse.json({
    ok: true,
    confirmedCount,
    needed,
    pending,
    graceHours: GRACE_PERIOD_HOURS,
  });
}
