import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { allow, clientKey } from "@/lib/rate-limit";
import { apiText } from "@/lib/api-locale";

const schema = z.object({
  authorName: z.string().min(1).max(80),
  // Puede ir vacío solo en una publicación propia con foto.
  message: z.string().trim().max(2000),
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
    return NextResponse.json({ error: await apiText("invalidData") }, { status: 400 });
  }

  // Margen amplio: varias personas pueden compartir la misma conexión.
  const who = clientKey(req);
  if (
    !(await allow(`msg:${who}`, 15, 10 * 60)) ||
    !(await allow(`msg-day:${who}`, 100, 24 * 3600))
  ) {
    return NextResponse.json(
      { error: await apiText("tooManyMessages") },
      { status: 429 }
    );
  }

  const viewerId = (await auth())?.user?.id ?? null;

  // Sin sesión no se aceptan fotos, tampoco enlaces a imágenes externas.
  if (parsed.data.imageUrl && !viewerId) {
    return NextResponse.json(
      { error: await apiText("loginForPhoto") },
      { status: 401 }
    );
  }

  const owner = await prisma.user.findUnique({ where: { id: userId } });
  if (!owner) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  // Un mensaje para una mascota debe ser de una mascota de esa familia.
  const petId = parsed.data.petId ?? null;
  if (
    petId &&
    !(await prisma.pet.findFirst({ where: { id: petId, ownerId: userId } }))
  ) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  // Publicación propia: se decide con la sesión, no con lo que envíe el
  // navegador, y lleva el nombre de la cuenta.
  const byOwner = viewerId === userId && !petId;
  if (!parsed.data.message && !(byOwner && parsed.data.imageUrl)) {
    return NextResponse.json(
      { error: await apiText("invalidData") },
      { status: 400 }
    );
  }

  const created = await prisma.memorialMessage.create({
    data: {
      ownerId: userId,
      petId,
      byOwner,
      authorName: byOwner ? owner.name : parsed.data.authorName,
      message: parsed.data.message,
      imageUrl: parsed.data.imageUrl ?? null,
      isPublic: parsed.data.isPublic ?? true,
    },
  });

  return NextResponse.json({ ok: true, message: created });
}
