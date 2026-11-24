import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canViewStory } from "@/lib/stories";

// Marca una historia como vista (para el aro "sin ver" de la barra).
export async function POST(
  _req: Request,
  { params }: RouteContext<"/api/stories/[id]/view">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const me = session.user.id;

  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    select: { id: true, authorId: true, expiresAt: true },
  });
  // Misma respuesta si no existe o si no tienes permiso: no revela nada.
  if (!story || !(await canViewStory(me, story))) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (story.authorId !== me) {
    await prisma.storyView.upsert({
      where: { storyId_viewerId: { storyId: story.id, viewerId: me } },
      create: { storyId: story.id, viewerId: me },
      update: {},
    });
  }

  return NextResponse.json({ ok: true });
}
