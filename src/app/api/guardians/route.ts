import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, EmailSendError } from "@/lib/email";
import { guardianInviteEmail } from "@/lib/email-templates";
import { notifyGuardianInvite } from "@/lib/notifications";
import { apiText } from "@/lib/api-locale";
import { localeForEmail } from "@/lib/user-locale";
import { routing } from "@/i18n/routing";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  locale: z.enum(routing.locales).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: await apiText("invalidData") }, { status: 400 });
  }

  const owner = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const guardian = await prisma.guardian.create({
    data: {
      ownerId: session.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      locale: parsed.data.locale,
    },
  });

  const notified = await notifyGuardianInvite({
    guardianEmail: guardian.email,
    guardianToken: guardian.token,
    ownerId: owner.id,
    ownerName: owner.name,
  });

  let emailError: string | null = null;
  try {
    await sendEmail({
      to: guardian.email,
      ...guardianInviteEmail({
        locale: await localeForEmail(guardian.email, guardian.locale),
        guardianName: guardian.name,
        ownerName: owner.name,
        token: guardian.token,
      }),
    });
  } catch (err) {
    if (!notified) {
      emailError = await apiText(
        err instanceof EmailSendError
          ? "guardianAddedNoEmail"
          : "guardianAddedError"
      );
    }
  }

  return NextResponse.json({ ok: true, guardian, emailError, notified });
}
