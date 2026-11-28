import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deliverCapsule, finalizePendingDeaths } from "@/lib/delivery";
import { cleanupExpiredStories } from "@/lib/stories";
import { startOfTomorrow } from "@/lib/special-dates";
import { createEventReminders } from "@/lib/special-dates-db";
import { cleanupRateLimits } from "@/lib/rate-limit";

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
      triggerDate: { lt: startOfTomorrow() },
      recipients: { some: { delivered: false } },
    },
    select: { id: true },
  });

  for (const capsule of due) {
    await deliverCapsule(capsule.id);
  }

  const finalizedDeaths = await finalizePendingDeaths();

  // Limpieza de historias vencidas. Aislada: un fallo aquí no debe impedir
  // que las entregas de arriba se reporten como hechas.
  let expiredStoriesDeleted = 0;
  try {
    expiredStoriesDeleted = await cleanupExpiredStories();
  } catch (err) {
    console.error(
      "[Akashia] Falló la limpieza de historias:",
      err instanceof Error ? err.message : err
    );
  }

  // Recordatorios de las fechas especiales de hoy, también aislados.
  let eventReminders = 0;
  try {
    eventReminders = await createEventReminders();
  } catch (err) {
    console.error(
      "[Akashia] Fallaron los recordatorios de fechas:",
      err instanceof Error ? err.message : err
    );
  }

  await cleanupRateLimits().catch((err) =>
    console.error("[Akashia] Falló la limpieza de contadores:", err?.message)
  );

  return NextResponse.json({
    ok: true,
    delivered: due.length,
    finalizedDeaths,
    expiredStoriesDeleted,
    eventReminders,
  });
}
