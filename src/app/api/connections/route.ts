import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_PENDING_SENT } from "@/lib/connections";
import {
  notifyConnectionAccepted,
  notifyConnectionRequest,
} from "@/lib/notifications";

const schema = z.object({ userId: z.string().min(1) });

// Enviar una solicitud de conexión.
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
      { error: "No puedes conectar contigo mismo" },
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
      where: {
        OR: [
          { requesterId: me, addresseeId: targetId },
          { requesterId: targetId, addresseeId: me },
        ],
      },
    }),
  ]);

  if (!target) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (existing) {
    if (existing.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "Ya están conectados" },
        { status: 409 }
      );
    }
    if (existing.requesterId === me) {
      return NextResponse.json(
        { error: "Ya enviaste una solicitud a esta persona" },
        { status: 409 }
      );
    }
    // Esa persona ya me había enviado una solicitud: al pedir yo conectar,
    // se acepta directamente.
    const accepted = await prisma.connection.update({
      where: { id: existing.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
    await notifyConnectionAccepted({
      toUserId: existing.requesterId,
      fromName: meUser.name,
    });
    return NextResponse.json({ ok: true, connection: accepted, accepted: true });
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
  await notifyConnectionRequest({ toUserId: targetId, fromName: meUser.name });

  return NextResponse.json({ ok: true, connection, accepted: false });
}
