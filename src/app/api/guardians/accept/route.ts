import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiText } from "@/lib/api-locale";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: await apiText("missingToken") }, { status: 400 });
  }

  const guardian = await prisma.guardian.findUnique({ where: { token } });
  if (!guardian) {
    return NextResponse.json({ error: await apiText("invalidLink") }, { status: 404 });
  }

  if (guardian.userId && guardian.userId !== session.user.id) {
    return NextResponse.json(
      { error: await apiText("inviteTaken") },
      { status: 409 }
    );
  }

  if (guardian.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json(
      {
        error: await apiText("inviteOtherEmail", { email: guardian.email }),
      },
      { status: 403 }
    );
  }

  await prisma.guardian.update({
    where: { id: guardian.id },
    data: { userId: session.user.id, status: "ACCEPTED" },
  });

  return NextResponse.json({ ok: true });
}
