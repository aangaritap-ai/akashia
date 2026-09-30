import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_EDITS = 3;

const schema = z.object({
  title: z.string().min(1),
  type: z.enum(["TEXT", "AUDIO", "VIDEO"]),
  textContent: z.string().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
  recipients: z
    .array(z.object({ name: z.string().min(1), email: z.string().email() }))
    .min(1),
  triggerType: z.enum(["DATE", "DEATH"]),
  triggerDate: z.string().optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: RouteContext<"/api/capsules/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.capsule.findUnique({
    where: { id },
    include: { recipients: true },
  });
  if (!existing || existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (existing.sealed) {
    return NextResponse.json(
      { error: "Esta cápsula ya está sellada y no se puede editar" },
      { status: 409 }
    );
  }
  if (existing.recipients.some((r) => r.delivered)) {
    return NextResponse.json(
      { error: "Ya se entregó a algún destinatario, no se puede editar" },
      { status: 409 }
    );
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

  const newEditCount = existing.editCount + 1;

  const capsule = await prisma.$transaction(async (tx) => {
    await tx.capsuleRecipient.deleteMany({ where: { capsuleId: id } });
    return tx.capsule.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        textContent: data.textContent ?? null,
        mediaUrl: data.mediaUrl ?? null,
        triggerType: data.triggerType,
        triggerDate: data.triggerDate
          ? new Date(`${data.triggerDate}T12:00:00`)
          : null,
        editCount: newEditCount,
        sealed: newEditCount >= MAX_EDITS,
        recipients: {
          create: data.recipients.map((r) => ({ name: r.name, email: r.email })),
        },
      },
      include: { recipients: true },
    });
  });

  return NextResponse.json({ ok: true, capsule });
}
