import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { relationFromRow } from "@/lib/connections";

// Busca personas por nombre. A propósito NO busca ni devuelve correos, para
// que nadie pueda recorrer la lista de correos de los usuarios.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const me = session.user.id;

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: me },
      name: { contains: q, mode: "insensitive" },
    },
    select: { id: true, name: true, avatarUrl: true },
    orderBy: { name: "asc" },
    take: 8,
  });

  const rows = await prisma.connection.findMany({
    where: {
      OR: [
        { requesterId: me, addresseeId: { in: users.map((u) => u.id) } },
        { addresseeId: me, requesterId: { in: users.map((u) => u.id) } },
      ],
    },
    select: { id: true, status: true, requesterId: true, addresseeId: true },
  });

  const result = users.map((u) => {
    const row =
      rows.find((r) => r.requesterId === u.id || r.addresseeId === u.id) ??
      null;
    const rel = relationFromRow(row, me);
    return { ...u, state: rel.state, connectionId: rel.connectionId };
  });

  return NextResponse.json({ users: result });
}
