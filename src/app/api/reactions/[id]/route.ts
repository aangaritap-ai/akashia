import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const REACTION_FIELDS = {
  HEART: "heartCount",
  CONDOLENCES: "condolencesCount",
  CONGRATS: "congratsCount",
  SAD: "sadCount",
} as const;

const schema = z.object({
  type: z.enum(["HEART", "CONDOLENCES", "CONGRATS", "SAD"]),
  action: z.enum(["add", "remove"]),
});

export async function POST(
  req: Request,
  { params }: RouteContext<"/api/reactions/[id]">
) {
  const { id } = await params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const field = REACTION_FIELDS[parsed.data.type];

  const message = await prisma.memorialMessage.findUnique({
    where: { id },
    select: {
      heartCount: true,
      condolencesCount: true,
      congratsCount: true,
      sadCount: true,
    },
  });
  if (!message) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const current = message[field];
  const next =
    parsed.data.action === "add" ? current + 1 : Math.max(0, current - 1);

  const updated = await prisma.memorialMessage.update({
    where: { id },
    data: { [field]: next },
    select: {
      heartCount: true,
      condolencesCount: true,
      congratsCount: true,
      sadCount: true,
    },
  });

  return NextResponse.json({ ok: true, counts: updated });
}
