import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_PENDING_SENT } from "@/lib/connections";
import { notifyFollowRequest } from "@/lib/notifications";

const schema = z.object({ userId: z.string().min(1) });

// Pedir seguir a alguien. Queda pendiente hasta que esa persona lo apruebe.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const me = session.user.id;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const targetId = parsed.data.userId;

  if (targetId === me) {
    return NextResponse.json(
      { error: "No puedes seguirte a ti mismo" },
      { status: 400 }
    );
  }

  const [target, meUser, existing] = await Promise.all([
    prisma.user.findUnique({ where: { id: targetId }, select: { id: true } }),
    prisma.user.findUniqueOrThrow({
      where: { id: me },
      select: { name: true },
    }),
    prisma.connection.findFirst({
      where: { requesterId: me, addresseeId: targetId },
    }),
  ]);

  if (!target) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.status === "ACCEPTED"
            ? "Ya sigues a esta persona"
            : "Ya enviaste una solicitud a esta persona",
      },
      { status: 409 }
    );
  }

  const pendingSent = await prisma.connection.count({
    where: { requesterId: me, status: "PENDING" },
  });
  if (pendingSent >= MAX_PENDING_SENT) {
    return NextResponse.json(
      {
        error:
          "Tienes muchas solicitudes pendientes. Espera a que respondan o cancela algunas.",
      },
      { status: 429 }
    );
  }

  const connection = await prisma.connection.create({
    data: { requesterId: me, addresseeId: targetId },
  });
  await notifyFollowRequest({
    toUserId: targetId,
    fromId: me,
    fromName: meUser.name,
  });

  return NextResponse.json({ ok: true, connection });
}
