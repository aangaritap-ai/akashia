import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Límite de intentos. El contador vive en la base porque cada petición puede
// atenderla un servidor distinto.

/**
 * Cuenta un intento y dice si todavía está permitido: como máximo `limit`
 * por cada ventana de `seconds`.
 */
export async function allow(
  key: string,
  limit: number,
  seconds: number,
  db: Prisma.TransactionClient = prisma
): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + seconds * 1000);
  // Una sola sentencia, para que dos intentos a la vez se cuenten los dos.
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" <= ${now}
                THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now}
                  THEN ${resetAt} ELSE "RateLimit"."resetAt" END
    RETURNING "count"`;
  return Number(rows[0].count) <= limit;
}

/** Identifica a quien hace la petición sin guardar su dirección IP. */
export function clientKey(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  return createHash("sha256")
    .update(`${ip}|${process.env.NEXTAUTH_SECRET ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

/** Borra los contadores vencidos. Lo llama la tarea diaria. */
export async function cleanupRateLimits() {
  const result = await prisma.rateLimit.deleteMany({
    where: { resetAt: { lt: new Date() } },
  });
  return result.count;
}
