import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiText } from "@/lib/api-locale";

// Borrar una historia propia antes de que venza.
export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/stories/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const { id } = await params;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story || story.authorId !== session.user.id) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  await prisma.story.delete({ where: { id } });
  const files = [story.imageUrl, ...(story.videoUrl ? [story.videoUrl] : [])];
  await del(files).catch((err) => {
    console.error(
      "[Akashia] No se pudieron borrar los archivos de la historia:",
      err instanceof Error ? err.message : err
    );
  });

  return NextResponse.json({ ok: true });
}
