import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyFollowAccepted } from "@/lib/notifications";
import { apiText } from "@/lib/api-locale";

const patchSchema = z.object({ action: z.enum(["accept", "decline"]) });

// Responder una solicitud para seguirme (solo la persona seguida).
export async function PATCH(
  req: Request,
  { params }: RouteContext<"/api/connections/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }
  const me = session.user.id;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: await apiText("invalidData") }, { status: 400 });
  }

  const { id } = await params;
  const connection = await prisma.connection.findUnique({ where: { id } });
  if (
    !connection ||
    connection.addresseeId !== me ||
    connection.status !== "PENDING"
  ) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  // El aviso de esa solicitud: se borra si se rechaza y queda leído si se
  // acepta.
  const requestNotice = {
    userId: me,
    actorId: connection.requesterId,
    type: "CONNECTION_REQUEST",
  } as const;

  if (parsed.data.action === "decline") {
    await prisma.connection.delete({ where: { id } });
    await prisma.notification.deleteMany({ where: requestNotice });
    return NextResponse.json({ ok: true });
  }

  await prisma.connection.update({
    where: { id },
    data: { status: "ACCEPTED", respondedAt: new Date() },
  });
  await prisma.notification.updateMany({
    where: requestNotice,
    data: { read: true },
  });
  const meUser = await prisma.user.findUniqueOrThrow({
    where: { id: me },
    select: { name: true },
  });
  await notifyFollowAccepted({
    toUserId: connection.requesterId,
    fromId: me,
    fromName: meUser.name,
  });
  return NextResponse.json({ ok: true });
}

// Cancelar mi solicitud o dejar de seguir (quien sigue), o quitar a un
// seguidor (la persona seguida).
export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/connections/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }
  const me = session.user.id;

  const { id } = await params;
  const connection = await prisma.connection.findUnique({ where: { id } });
  if (
    !connection ||
    (connection.requesterId !== me && connection.addresseeId !== me)
  ) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  await prisma.connection.delete({ where: { id } });
  // Sin relación, el aviso de la solicitud ya no tiene sentido.
  await prisma.notification.deleteMany({
    where: {
      userId: connection.addresseeId,
      actorId: connection.requesterId,
      type: "CONNECTION_REQUEST",
    },
  });
  return NextResponse.json({ ok: true });
}
