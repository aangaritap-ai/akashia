import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

const unauthorized = () =>
  NextResponse.json({ error: "No autenticado" }, { status: 401 });

// Los avisos para el panel de la campana.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const items = await listNotifications(session.user.id);
  return NextResponse.json({ items });
}

// Marcar todas como leídas.
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  await prisma.notification.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
