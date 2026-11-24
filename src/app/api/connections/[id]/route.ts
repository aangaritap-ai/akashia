import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyConnectionAccepted } from "@/lib/notifications";

const patchSchema = z.object({ action: z.enum(["accept", "decline"]) });

// Responder una solicitud recibida (solo el destinatario).
export async function PATCH(
  req: Request,
  { params }: RouteContext<"/api/connections/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const me = session.user.id;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { id } = await params;
  const connection = await prisma.connection.findUnique({ where: { id } });
  if (
    !connection ||
    connection.addresseeId !== me ||
    connection.status !== "PENDING"
  ) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (parsed.data.action === "decline") {
    await prisma.connection.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  await prisma.connection.update({
    where: { id },
    data: { status: "ACCEPTED", respondedAt: new Date() },
  });
  const meUser = await prisma.user.findUniqueOrThrow({
    where: { id: me },
    select: { name: true },
  });
  await notifyConnectionAccepted({
    toUserId: connection.requesterId,
    fromName: meUser.name,
  });
  return NextResponse.json({ ok: true });
}

// Cancelar una solicitud enviada, o quitar una conexión (cualquiera de las dos partes).
export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/connections/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const me = session.user.id;

  const { id } = await params;
  const connection = await prisma.connection.findUnique({ where: { id } });
  if (
    !connection ||
    (connection.requesterId !== me && connection.addresseeId !== me)
  ) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.connection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
