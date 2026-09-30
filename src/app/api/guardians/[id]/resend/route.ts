import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, EmailSendError } from "@/lib/email";
import { guardianInviteEmail } from "@/lib/email-templates";

export async function POST(
  _req: Request,
  { params }: RouteContext<"/api/guardians/[id]/resend">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const guardian = await prisma.guardian.findUnique({
    where: { id },
    include: { owner: true },
  });
  if (!guardian || guardian.ownerId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const confirmUrl = `${process.env.APP_URL || "http://localhost:3000"}/guardian/${guardian.token}`;

  try {
    await sendEmail({
      to: guardian.email,
      subject: `${guardian.owner.name} te designó como guardián en Akashia`,
      html: guardianInviteEmail({
        guardianName: guardian.name,
        ownerName: guardian.owner.name,
        confirmUrl,
      }),
    });
  } catch (err) {
    const message =
      err instanceof EmailSendError
        ? err.message
        : "No se pudo enviar el correo";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
