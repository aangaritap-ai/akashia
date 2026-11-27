import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiText } from "@/lib/api-locale";
import { contactData, contactSchema } from "@/lib/contact";
import { prisma } from "@/lib/prisma";

// Guarda los datos obligatorios de la propia cuenta.
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: await apiText("notAuthenticated") },
      { status: 401 }
    );
  }
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: await apiText("contactInvalid") },
      { status: 400 }
    );
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: contactData(parsed.data),
  });
  return NextResponse.json({ ok: true });
}
