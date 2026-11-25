import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DATE_KINDS,
  MAX_DATES,
  MAX_DATE_TITLE,
  MIN_YEAR,
  isValidDay,
  todayIn,
} from "@/lib/special-dates";

const schema = z.object({
  title: z.string().trim().min(1).max(MAX_DATE_TITLE),
  kind: z.enum(DATE_KINDS),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  year: z.number().int().min(MIN_YEAR).optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const me = session.user.id;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa el nombre y la fecha" },
      { status: 400 }
    );
  }
  const { title, kind, month, day, year } = parsed.data;

  if (!isValidDay(month, day, year)) {
    return NextResponse.json({ error: "Esa fecha no existe" }, { status: 400 });
  }
  if (year && year > todayIn().year) {
    return NextResponse.json(
      { error: "El año no puede ser futuro" },
      { status: 400 }
    );
  }

  const count = await prisma.specialDate.count({ where: { ownerId: me } });
  if (count >= MAX_DATES) {
    return NextResponse.json(
      { error: "Llegaste al máximo de fechas. Borra alguna para agregar otra." },
      { status: 429 }
    );
  }

  const created = await prisma.specialDate.create({
    data: { ownerId: me, title, kind, month, day, year: year ?? null },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
