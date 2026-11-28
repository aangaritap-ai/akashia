import type { CapsuleRecipient, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { RecipientRow } from "@/lib/recipients";

type Db = Prisma.TransactionClient;

export const recipientSchema = z.union([
  z.object({ followerId: z.string().min(1) }),
  z.object({ recipientId: z.string().min(1) }),
  z.object({ name: z.string().min(1), email: z.string().email() }),
]);

export type RecipientInput = z.infer<typeof recipientSchema>;

/** Quienes siguen a `ownerId`, con su correo. No se envía al navegador. */
function followerAccounts(ownerId: string, db: Db) {
  return db.connection
    .findMany({
      where: {
        addresseeId: ownerId,
        status: "ACCEPTED",
        requester: { isDeceased: false },
      },
      select: {
        requester: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })
    .then((rows) => rows.map((r) => r.requester));
}

/**
 * Convierte lo recibido en destinatarios por guardar. Devuelve `null` si se
 * eligió a alguien que no le sigue, o una fila que no es de esta cápsula.
 * `saved` son los destinatarios que ya tenía.
 */
export async function resolveRecipients(
  ownerId: string,
  list: RecipientInput[],
  saved: Pick<CapsuleRecipient, "id" | "name" | "email" | "fromFollower">[] = [],
  db: Db = prisma
) {
  const followers = list.some((r) => "followerId" in r)
    ? await followerAccounts(ownerId, db)
    : [];
  const result: { name: string; email: string; fromFollower: boolean }[] = [];
  const chosen = new Set<string>();

  for (const item of list) {
    if ("email" in item) {
      result.push({ name: item.name, email: item.email, fromFollower: false });
      continue;
    }
    const found =
      "followerId" in item
        ? followers.find((f) => f.id === item.followerId)
        : saved.find((r) => r.id === item.recipientId && r.fromFollower);
    if (!found) return null;
    // La misma persona elegida dos veces recibe un solo correo.
    if (chosen.has(found.email)) continue;
    chosen.add(found.email);
    result.push({ name: found.name, email: found.email, fromFollower: true });
  }
  return result;
}

/** Las filas del formulario de edición, sin el correo de los seguidores. */
export async function recipientRows(
  ownerId: string,
  saved: Pick<CapsuleRecipient, "id" | "name" | "email" | "fromFollower">[],
  db: Db = prisma
): Promise<RecipientRow[]> {
  const followers = saved.some((r) => r.fromFollower)
    ? await followerAccounts(ownerId, db)
    : [];
  return saved.map((r) => {
    if (!r.fromFollower) {
      return { kind: "manual", key: r.id, name: r.name, email: r.email };
    }
    const account = followers.find((f) => f.email === r.email);
    return {
      kind: "follower",
      key: r.id,
      name: r.name,
      avatarUrl: account?.avatarUrl ?? null,
      followerId: account?.id ?? null,
      recipientId: r.id,
    };
  });
}
