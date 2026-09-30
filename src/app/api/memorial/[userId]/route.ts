import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  authorName: z.string().min(1).max(80),
  message: z.string().min(1).max(2000),
  isPublic: z.boolean().optional(),
});

export async function POST(
  req: Request,
  { params }: RouteContext<"/api/memorial/[userId]">
) {
  const { userId } = await params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const owner = await prisma.user.findUnique({ where: { id: userId } });
  if (!owner) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const created = await prisma.memorialMessage.create({
    data: {
      ownerId: userId,
      authorName: parsed.data.authorName,
      message: parsed.data.message,
      isPublic: parsed.data.isPublic ?? true,
    },
  });

  return NextResponse.json({ ok: true, message: created });
}
