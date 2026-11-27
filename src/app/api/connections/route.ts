import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_PENDING_SENT } from "@/lib/connections";
import { notifyFollowRequest } from "@/lib/notifications";
import { apiText } from "@/lib/api-locale";

const schema = z.object({ userId: z.string().min(1) });

// Pedir seguir a alguien. Queda pendiente hasta que esa persona lo apruebe.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }
  const me = session.user.id;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: await apiText("invalidData") }, { status: 400 });
  }
  const targetId = parsed.data.userId;

  if (targetId === me) {
    return NextResponse.json(
      { error: await apiText("selfFollow") },
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
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  if (existing) {
    return NextResponse.json(
      {
        error: await apiText(
          existing.status === "ACCEPTED"
            ? "alreadyFollowing"
            : "alreadyRequested"
        ),
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
        error: await apiText("tooManyPending"),
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
