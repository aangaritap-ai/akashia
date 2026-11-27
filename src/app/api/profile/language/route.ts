import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiText } from "@/lib/api-locale";
import { routing } from "@/i18n/routing";

const schema = z.object({ locale: z.enum(routing.locales) });

// Guarda el idioma elegido, para los correos y avisos de esa persona.
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: await apiText("notAuthenticated") },
      { status: 401 }
    );
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: await apiText("invalidData") },
      { status: 400 }
    );
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { locale: parsed.data.locale },
  });
  return NextResponse.json({ ok: true });
}
