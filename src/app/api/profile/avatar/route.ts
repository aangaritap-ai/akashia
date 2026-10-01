import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
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
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "La imagen no puede pesar más de 5MB" },
      { status: 400 }
    );
  }

  const blob = await put(
    `avatars/${session.user.id}/${Date.now()}-${file.name}`,
    file,
    { access: "public" }
  );

  return NextResponse.json({ url: blob.url });
}
