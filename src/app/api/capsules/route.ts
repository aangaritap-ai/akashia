import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(1),
  type: z.enum(["TEXT", "AUDIO", "VIDEO"]),
  textContent: z.string().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
  recipientName: z.string().min(1),
  recipientEmail: z.string().email(),
  triggerType: z.enum(["DATE", "DEATH"]),
  triggerDate: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (data.triggerType === "DATE" && !data.triggerDate) {
    return NextResponse.json(
      { error: "Falta la fecha de entrega" },
      { status: 400 }
    );
  }
  if ((data.type === "AUDIO" || data.type === "VIDEO") && !data.mediaUrl) {
    return NextResponse.json(
      { error: "Falta el archivo de audio/video" },
      { status: 400 }
    );
  }
  if (data.type === "TEXT" && !data.textContent) {
    return NextResponse.json(
      { error: "El mensaje de texto está vacío" },
      { status: 400 }
    );
  }

  const capsule = await prisma.capsule.create({
    data: {
      ownerId: session.user.id,
      title: data.title,
      type: data.type,
      textContent: data.textContent ?? null,
      mediaUrl: data.mediaUrl ?? null,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      triggerType: data.triggerType,
      triggerDate: data.triggerDate
        ? new Date(`${data.triggerDate}T12:00:00`)
        : null,
    },
  });

  return NextResponse.json({ ok: true, capsule });
}
