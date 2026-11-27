import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFiles } from "@/lib/own-files";
import { isStorageUrl } from "@/lib/uploads";
import { apiText } from "@/lib/api-locale";

// El dueño de una página borra un mensaje que le dejaron (a él o a una de sus
// mascotas).
export async function DELETE(
  _req: Request,
  { params }: RouteContext<"/api/messages/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const { id } = await params;
  const message = await prisma.memorialMessage.findFirst({
    where: { id, ownerId: session.user.id },
    select: { imageUrl: true },
  });
  if (!message) {
    return NextResponse.json({ error: await apiText("notFound") }, { status: 404 });
  }

  await prisma.memorialMessage.delete({ where: { id } });

  // La foto adjunta se borra si es de la carpeta de mensajes y ningún otro
  // mensaje la usa.
  const photo = message.imageUrl;
  if (
    photo &&
    isStorageUrl(photo) &&
    new URL(photo).pathname.startsWith("/memorial/") &&
    (await prisma.memorialMessage.count({ where: { imageUrl: photo } })) === 0
  ) {
    await deleteFiles([photo]);
  }
  return NextResponse.json({ ok: true });
}
