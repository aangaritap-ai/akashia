import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Borrar una historia propia antes de que venza.
export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/stories/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story || story.authorId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.story.delete({ where: { id } });
  await del(story.imageUrl).catch((err) => {
    console.error(
      "[Akashia] No se pudo borrar la foto de la historia:",
      err instanceof Error ? err.message : err
    );
  });

  return NextResponse.json({ ok: true });
}
