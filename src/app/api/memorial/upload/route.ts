import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, TOO_BIG_MESSAGE, storageConfigured } from "@/lib/uploads";

// Adjuntar fotos exige sesión: sin cuenta solo se dejan mensajes de texto.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Inicia sesión para adjuntar una foto" },
      { status: 401 }
    );
  }

  if (!storageConfigured()) {
    return NextResponse.json(
      { error: "El almacenamiento de imágenes no está configurado todavía." },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No se envió archivo" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Solo se permiten imágenes" },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: TOO_BIG_MESSAGE }, { status: 400 });
  }

  const blob = await put(`memorial/${session.user.id}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
