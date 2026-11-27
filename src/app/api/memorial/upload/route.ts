import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, storageConfigured } from "@/lib/uploads";
import { apiText } from "@/lib/api-locale";

// Adjuntar fotos exige sesión: sin cuenta solo se dejan mensajes de texto.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: await apiText("loginForPhoto") },
      { status: 401 }
    );
  }

  if (!storageConfigured()) {
    return NextResponse.json(
      { error: await apiText("imageStorageOff") },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: await apiText("noFile") }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: await apiText("imagesOnly") },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: await apiText("imageTooBig") }, { status: 400 });
  }

  const blob = await put(`memorial/${session.user.id}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
