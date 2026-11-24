import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_ACTIVE_STORIES,
  MAX_CAPTION,
  MAX_STORY_IMAGE_BYTES,
  STORY_HOURS,
  STORY_IMAGE_TYPES,
} from "@/lib/stories";

// Publicar una historia: foto + texto corto. Exige sesión.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const me = session.user.id;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "El almacenamiento de imágenes no está configurado todavía." },
      { status: 503 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Elige una foto" }, { status: 400 });
  }

  const ext = STORY_IMAGE_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Usa una foto JPG, PNG, WebP o GIF" },
      { status: 400 }
    );
  }
  if (file.size > MAX_STORY_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "La foto no puede pesar más de 5 MB" },
      { status: 400 }
    );
  }

  const rawCaption = form?.get("caption");
  const caption =
    typeof rawCaption === "string" ? rawCaption.trim().slice(0, MAX_CAPTION) : "";

  const active = await prisma.story.count({
    where: { authorId: me, expiresAt: { gt: new Date() } },
  });
  if (active >= MAX_ACTIVE_STORIES) {
    return NextResponse.json(
      { error: "Ya tienes muchas historias activas. Espera a que venzan o borra alguna." },
      { status: 429 }
    );
  }

  // El nombre del archivo lo decidimos nosotros (no el de quien sube) y lleva
  // un sufijo aleatorio para que la dirección no se pueda adivinar.
  const blob = await put(`stories/${me}/story.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  try {
    const story = await prisma.story.create({
      data: {
        authorId: me,
        imageUrl: blob.url,
        caption: caption || null,
        expiresAt: new Date(Date.now() + STORY_HOURS * 60 * 60 * 1000),
      },
    });
    return NextResponse.json({ ok: true, id: story.id });
  } catch (err) {
    await del(blob.url).catch(() => {});
    throw err;
  }
}
