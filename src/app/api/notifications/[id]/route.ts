import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const notFound = () =>
  NextResponse.json({ error: "No encontrado" }, { status: 404 });
const unauthorized = () =>
  NextResponse.json({ error: "No autenticado" }, { status: 401 });

// Marcar un aviso como leído. El filtro por dueño evita tocar los de otros.
export async function PATCH(
  _req: Request,
  { params }: RouteContext<"/api/notifications/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;
  const { count } = await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { read: true },
  });
  return count ? NextResponse.json({ ok: true }) : notFound();
}

export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/notifications/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;
  const { count } = await prisma.notification.deleteMany({
    where: { id, userId: session.user.id },
  });
  return count ? NextResponse.json({ ok: true }) : notFound();
}
