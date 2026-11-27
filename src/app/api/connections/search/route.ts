import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { followFromRow } from "@/lib/connections";
import { apiText } from "@/lib/api-locale";

// Busca personas por nombre. A propósito NO busca ni devuelve correos, para
// que nadie pueda recorrer la lista de correos de los usuarios.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
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

  // Mi relación hacia cada resultado (a quién sigo o pedí seguir).
  const rows = await prisma.connection.findMany({
    where: { requesterId: me, addresseeId: { in: users.map((u) => u.id) } },
    select: { id: true, status: true, addresseeId: true },
  });

  const result = users.map((u) => {
    const rel = followFromRow(
      rows.find((r) => r.addresseeId === u.id) ?? null
    );
    return { ...u, state: rel.state, connectionId: rel.connectionId };
  });

  return NextResponse.json({ users: result });
}
