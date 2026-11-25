import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/special-dates/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  // Solo borra si es de quien pide; si no, responde igual que si no existiera.
  const result = await prisma.specialDate.deleteMany({
    // Las de mascotas se quitan desde la mascota.
    where: { id, ownerId: session.user.id, petId: null },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
