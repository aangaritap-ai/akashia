import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  authorName: z.string().min(1).max(80),
  message: z.string().min(1).max(2000),
  imageUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
  petId: z.string().optional().nullable(),
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

  // Sin sesión no se aceptan fotos, tampoco enlaces a imágenes externas.
  if (parsed.data.imageUrl && !(await auth())?.user?.id) {
    return NextResponse.json(
      { error: "Inicia sesión para adjuntar una foto" },
      { status: 401 }
    );
  }

  const owner = await prisma.user.findUnique({ where: { id: userId } });
  if (!owner) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Un mensaje para una mascota debe ser de una mascota de esa familia.
  const petId = parsed.data.petId ?? null;
  if (
    petId &&
    !(await prisma.pet.findFirst({ where: { id: petId, ownerId: userId } }))
  ) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const created = await prisma.memorialMessage.create({
    data: {
      ownerId: userId,
      petId,
      authorName: parsed.data.authorName,
      message: parsed.data.message,
      imageUrl: parsed.data.imageUrl ?? null,
      isPublic: parsed.data.isPublic ?? true,
    },
  });

  return NextResponse.json({ ok: true, message: created });
}
