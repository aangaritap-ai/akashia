import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, EmailSendError } from "@/lib/email";
import { guardianInviteEmail } from "@/lib/email-templates";
import { notifyGuardianInvite } from "@/lib/notifications";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const owner = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const guardian = await prisma.guardian.create({
    data: {
      ownerId: session.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
    },
  });

  const confirmUrl = `${process.env.APP_URL || "http://localhost:3000"}/guardian/${guardian.token}`;

  const notified = await notifyGuardianInvite({
    guardianEmail: guardian.email,
    guardianToken: guardian.token,
    ownerName: owner.name,
  });

  let emailError: string | null = null;
  try {
    await sendEmail({
      to: guardian.email,
      subject: `${owner.name} te designó como guardián en Akashia`,
      html: guardianInviteEmail({
        guardianName: guardian.name,
        ownerName: owner.name,
        confirmUrl,
      }),
    });
  } catch (err) {
    if (!notified) {
      emailError =
        err instanceof EmailSendError
          ? "El guardián se agregó, pero el correo de invitación no se pudo enviar. Usa 'Reenviar' más tarde, o comparte el enlace manualmente."
          : "El guardián se agregó, pero ocurrió un error inesperado enviando el correo.";
    }
  }

  return NextResponse.json({ ok: true, guardian, emailError, notified });
}
