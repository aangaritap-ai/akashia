import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOwnMedia } from "@/lib/media";
import { apiText } from "@/lib/api-locale";
import { recipientSchema, resolveRecipients } from "@/lib/recipients-db";
import { routing } from "@/i18n/routing";

const schema = z.object({
  title: z.string().min(1),
  type: z.enum(["TEXT", "AUDIO", "VIDEO"]),
  textContent: z.string().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
  recipients: z.array(recipientSchema).min(1),
  triggerType: z.enum(["DATE", "DEATH"]),
  triggerDate: z.string().optional().nullable(),
  // Idioma del correo de entrega.
  locale: z.enum(routing.locales).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: await apiText("notAuthenticated") }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: await apiText("invalidData"), details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (data.triggerType === "DATE" && !data.triggerDate) {
    return NextResponse.json(
      { error: await apiText("missingDate") },
      { status: 400 }
    );
  }
  if ((data.type === "AUDIO" || data.type === "VIDEO") && !data.mediaUrl) {
    return NextResponse.json(
      { error: await apiText("missingMedia") },
      { status: 400 }
    );
  }
  // El enlace viaja en el correo de entrega: solo archivos propios.
  if (data.mediaUrl && !isOwnMedia(data.mediaUrl, session.user.id)) {
    return NextResponse.json({ error: await apiText("invalidFile") }, { status: 400 });
  }
  if (data.type === "TEXT" && !data.textContent) {
    return NextResponse.json(
      { error: await apiText("emptyText") },
      { status: 400 }
    );
  }

  const recipients = await resolveRecipients(session.user.id, data.recipients);
  if (!recipients) {
    return NextResponse.json({ error: await apiText("notFollower") }, { status: 400 });
  }

  const capsule = await prisma.capsule.create({
    data: {
      ownerId: session.user.id,
      title: data.title,
      type: data.type,
      textContent: data.textContent ?? null,
      mediaUrl: data.mediaUrl ?? null,
      triggerType: data.triggerType,
      triggerDate: data.triggerDate
        ? new Date(`${data.triggerDate}T12:00:00`)
        : null,
      recipients: {
        create: recipients.map((r) => ({ ...r, locale: data.locale })),
      },
    },
  });

  return NextResponse.json({ ok: true, capsule });
}
