import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const existingGuardianEmails = (
    await prisma.guardian.findMany({
      where: { ownerId: session.user.id },
      select: { email: true },
    })
  ).map((g) => g.email.toLowerCase());

  const users = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 6,
  });

  const filtered = users.filter(
    (u) => !existingGuardianEmails.includes(u.email.toLowerCase())
  );

  return NextResponse.json({ users: filtered });
}
