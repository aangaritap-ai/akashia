import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { allow, clientKey } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";
import { apiText } from "@/lib/api-locale";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: await apiText("invalidEmail") }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  // Protege el cupo diario de correos, del que también dependen las entregas.
  if (!(await allow(`reset-ip:${clientKey(req)}`, 10, 3600))) {
    return NextResponse.json(
      { error: await apiText("tooManyAttempts") },
      { status: 429 }
    );
  }
  // Por correo se responde igual, para no revelar qué cuentas existen.
  if (!(await allow(`reset-mail:${email}`, 3, 3600))) {
    return NextResponse.json({ ok: true });
  }
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

  try {
    await sendEmail({
      to: user.email,
      subject: "Recupera tu contraseña — Akashia",
      html: passwordResetEmail({ name: user.name, resetUrl }),
    });
  } catch (err) {
    // La respuesta no cambia: un error aquí delataría que la cuenta existe.
    console.error(
      "[Akashia] No se pudo enviar la recuperación:",
      err instanceof Error ? err.message : err
    );
  }

  return NextResponse.json({ ok: true });
}
