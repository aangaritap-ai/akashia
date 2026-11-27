import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, EmailSendError } from "@/lib/email";
import { guardianInviteEmail } from "@/lib/email-templates";
import { notifyGuardianInvite } from "@/lib/notifications";
import { apiText } from "@/lib/api-locale";
import { localeForEmail } from "@/lib/user-locale";

export async function POST(
  _req: Request,
  { params }: RouteContext<"/api/guardians/[id]/resend">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const { id } = await params;
  const guardian = await prisma.guardian.findUnique({
    where: { id },
    include: { owner: true },
  });
  if (!guardian || guardian.ownerId !== session.user.id) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  const notified = await notifyGuardianInvite({
    guardianEmail: guardian.email,
    guardianToken: guardian.token,
    ownerId: guardian.ownerId,
    ownerName: guardian.owner.name,
  });

  try {
    await sendEmail({
      to: guardian.email,
      ...guardianInviteEmail({
        locale: await localeForEmail(guardian.email, guardian.locale),
        guardianName: guardian.name,
        ownerName: guardian.owner.name,
        token: guardian.token,
      }),
    });
  } catch (err) {
    if (!notified) {
      const message =
        err instanceof EmailSendError
          ? err.message
          : await apiText("emailFailed");
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, notified });
}
