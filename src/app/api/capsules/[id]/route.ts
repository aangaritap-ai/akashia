import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOwnMedia } from "@/lib/media";
import { capsuleLockReason, deleteUnusedCapsuleMedia } from "@/lib/capsules";
import { apiText } from "@/lib/api-locale";
import { routing } from "@/i18n/routing";

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
  // Idioma del correo de entrega.
  locale: z.enum(routing.locales).optional(),
});

export async function PATCH(
  req: Request,
  { params }: RouteContext<"/api/capsules/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.capsule.findUnique({
    where: { id },
    include: { recipients: true, owner: true },
  });
  if (!existing || existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }
  const locked = capsuleLockReason(existing.owner);
  if (locked) {
    return NextResponse.json({ error: await apiText(locked) }, { status: 409 });
  }
  if (existing.recipients.some((r) => r.delivered)) {
    return NextResponse.json(
      { error: await apiText("deliveredNoEdit") },
      { status: 409 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: await apiText("invalidData"), details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (data.triggerType === "DATE" && !data.triggerDate) {
    return NextResponse.json(
      { error: await apiText("missingDate") },
      { status: 400 }
    );
  }
  if ((data.type === "AUDIO" || data.type === "VIDEO") && !data.mediaUrl) {
    return NextResponse.json(
      { error: await apiText("missingMedia") },
      { status: 400 }
    );
  }
  // Un archivo nuevo debe ser propio; el que ya tenía se conserva.
  if (
    data.mediaUrl &&
    data.mediaUrl !== existing.mediaUrl &&
    !isOwnMedia(data.mediaUrl, existing.ownerId)
  ) {
    return NextResponse.json({ error: await apiText("invalidFile") }, { status: 400 });
  }
  if (data.type === "TEXT" && !data.textContent) {
    return NextResponse.json(
      { error: await apiText("emptyText") },
      { status: 400 }
    );
  }

  const capsule = await prisma.$transaction(async (tx) => {
    // Se quitan solo los pendientes: si alguien recibió la cápsula mientras
    // se editaba, quedan filas y el cambio se cancela.
    await tx.capsuleRecipient.deleteMany({
      where: { capsuleId: id, delivered: false },
    });
    if (await tx.capsuleRecipient.count({ where: { capsuleId: id } })) {
      throw new Error("La cápsula se entregó mientras se editaba");
    }
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
        editCount: { increment: 1 },
        sealed: false,
        recipients: {
          create: data.recipients.map((r) => ({
          name: r.name,
          email: r.email,
          locale: data.locale,
        })),
        },
      },
      include: { recipients: true },
    });
  });

  // Si cambió el archivo, el anterior ya no le sirve a nadie.
  if (existing.mediaUrl !== capsule.mediaUrl) {
    await deleteUnusedCapsuleMedia(existing.mediaUrl, existing.ownerId);
  }

  return NextResponse.json({ ok: true, capsule });
}

// Borrar una cápsula que todavía nadie ha recibido.
export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/capsules/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.capsule.findUnique({
    where: { id },
    include: { owner: true },
  });
  if (!existing || existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }
  const locked = capsuleLockReason(existing.owner);
  if (locked) {
    return NextResponse.json({ error: await apiText(locked) }, { status: 409 });
  }

  // La condición va en el mismo borrado, por si se entrega en este instante.
  const result = await prisma.capsule.deleteMany({
    where: { id, recipients: { none: { delivered: true } } },
  });
  if (result.count === 0) {
    return NextResponse.json(
      { error: await apiText("deliveredKept") },
      { status: 409 }
    );
  }
  await deleteUnusedCapsuleMedia(existing.mediaUrl, existing.ownerId);
  return NextResponse.json({ ok: true });
}
