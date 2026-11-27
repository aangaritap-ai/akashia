import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelDeathGracePeriod } from "@/lib/delivery";
import { apiText } from "@/lib/api-locale";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token : null;

  let ownerId: string | null = null;

  if (token) {
    const owner = await prisma.user.findUnique({
      where: { deceasedCancelToken: token },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json(
        { error: await apiText("deadLink") },
        { status: 404 }
      );
    }
    ownerId = owner.id;
  } else {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
    }
    ownerId = session.user.id;
  }

  const cancelled = await cancelDeathGracePeriod(ownerId);
  if (!cancelled) {
    return NextResponse.json(
      { error: await apiText("noPendingDeath") },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
