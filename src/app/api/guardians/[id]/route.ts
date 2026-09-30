import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/guardians/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const guardian = await prisma.guardian.findUnique({ where: { id } });
  if (!guardian || guardian.ownerId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.guardian.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
