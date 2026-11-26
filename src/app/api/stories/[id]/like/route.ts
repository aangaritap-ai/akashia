import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canViewStory, setStoryLike } from "@/lib/stories";

const schema = z.object({ liked: z.boolean() });

// Pone o quita el "me gusta" de una historia ajena que puedo ver.
export async function POST(
  req: Request,
  { params }: RouteContext<"/api/stories/[id]/like">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const me = session.user.id;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    select: { id: true, authorId: true, expiresAt: true },
  });
  // Misma respuesta si no existe o si no tienes permiso: no revela nada.
  if (!story || !(await canViewStory(me, story))) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (story.authorId === me) {
    return NextResponse.json(
      { error: "Es tu propia historia" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: me },
    select: { name: true },
  });
  await prisma.$transaction(
    (tx) =>
      setStoryLike(
        {
          storyId: story.id,
          authorId: story.authorId,
          viewerId: me,
          viewerName: user.name,
          liked: parsed.data.liked,
        },
        tx
      ),
    { timeout: 20_000, maxWait: 10_000 }
  );
  return NextResponse.json({ ok: true, liked: parsed.data.liked });
}
