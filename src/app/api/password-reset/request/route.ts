import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return ok, whether or not the account exists, so this endpoint
  // can't be used to check which emails have accounts.
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password/${token.token}`;

  await sendEmail({
    to: user.email,
    subject: "Recupera tu contraseña — Akashia",
    html: passwordResetEmail({ name: user.name, resetUrl }),
  });

  return NextResponse.json({ ok: true });
}
