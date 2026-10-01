import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deliverCapsule, finalizePendingDeaths } from "@/lib/delivery";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const due = await prisma.capsule.findMany({
    where: {
      triggerType: "DATE",
      triggerDate: { lte: new Date() },
      recipients: { some: { delivered: false } },
    },
    select: { id: true },
  });

  for (const capsule of due) {
    await deliverCapsule(capsule.id);
  }

  const finalizedDeaths = await finalizePendingDeaths();

  return NextResponse.json({
    ok: true,
    delivered: due.length,
    finalizedDeaths,
  });
}
