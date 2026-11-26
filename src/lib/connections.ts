import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// "Seguir con aprobación", de un solo sentido. En la tabla Connection:
//   requesterId = quien sigue (o pide seguir)
//   addresseeId = a quien se sigue, que aprueba o rechaza
// Que A siga a B no significa que B siga a A.

/** Máximo de solicitudes enviadas pendientes por persona (evita spam). */
export const MAX_PENDING_SENT = 50;

/** IDs de las personas a las que `userId` sigue (ya aprobado). */
export async function getFollowingIds(userId: string): Promise<string[]> {
  const rows = await prisma.connection.findMany({
    where: { requesterId: userId, status: "ACCEPTED" },
    select: { addresseeId: true },
  });
  return rows.map((r) => r.addresseeId);
}

/** ¿`followerId` sigue a `followedId`, con aprobación? */
export async function isFollowing(
  followerId: string,
  followedId: string
): Promise<boolean> {
  const row = await prisma.connection.findFirst({
    where: {
      requesterId: followerId,
      addresseeId: followedId,
      status: "ACCEPTED",
    },
    select: { id: true },
  });
  return row !== null;
}

/** Solicitudes para seguirme que aún no he respondido. */
export function pendingReceivedCount(userId: string) {
  return prisma.connection.count({
    where: { addresseeId: userId, status: "PENDING" },
  });
}

export type Person = { id: string; name: string; avatarUrl: string | null };

/** Conocidos que dos personas comparten: cuántos y la foto de algunos. */
export type Mutuals = { count: number; sample: Person[] };

const personSelect = { id: true, name: true, avatarUrl: true } as const;
const MUTUAL_SAMPLE = 2;
// Tope de seguridad para las consultas de conocidos.
const MAX_ROWS = 5000;

type Db = Prisma.TransactionClient;
type Link = { requesterId: string; addresseeId: string };

/** Para cada persona de `ids`, con quiénes tiene una relación aprobada (en
 * cualquier sentido). */
async function circles(ids: string[], db: Db) {
  const map = new Map<string, Set<string>>(ids.map((id) => [id, new Set()]));
  if (ids.length === 0) return map;
  const rows: Link[] = await db.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: { in: ids } }, { addresseeId: { in: ids } }],
    },
    select: { requesterId: true, addresseeId: true },
    take: MAX_ROWS,
  });
  for (const row of rows) {
    map.get(row.requesterId)?.add(row.addresseeId);
    map.get(row.addresseeId)?.add(row.requesterId);
  }
  return map;
}

/** Completa las fotos de muestra de cada grupo de conocidos. */
async function describeMutuals(
  common: Map<string, string[]>,
  db: Db
): Promise<Map<string, Mutuals>> {
  const wanted = [
    ...new Set(
      [...common.values()].flatMap((ids) => ids.slice(0, MUTUAL_SAMPLE))
    ),
  ];
  const people = wanted.length
    ? await db.user.findMany({
        where: { id: { in: wanted } },
        select: personSelect,
      })
    : [];
  const byId = new Map(people.map((p) => [p.id, p]));
  return new Map(
    [...common].map(([id, ids]) => [
      id,
      {
        count: ids.length,
        sample: ids
          .slice(0, MUTUAL_SAMPLE)
          .flatMap((other) => byId.get(other) ?? []),
      },
    ])
  );
}

/** Conocidos en común entre `me` y cada persona de `ids`. */
export async function mutualsWith(
  me: string,
  ids: string[],
  db: Db = prisma
): Promise<Map<string, Mutuals>> {
  if (ids.length === 0) return new Map();
  const map = await circles([me, ...ids], db);
  const mine = map.get(me)!;
  const common = new Map(
    ids.map((id) => [
      id,
      [...(map.get(id) ?? [])].filter((other) => other !== me && mine.has(other)),
    ])
  );
  return describeMutuals(common, db);
}

export type FollowRequest = {
  connectionId: string;
  person: Person;
  createdAt: Date;
  mutuals: Mutuals;
};

/** Quienes piden seguirme, de la solicitud más nueva a la más antigua. */
export async function followRequests(
  me: string,
  take = 50,
  db: Db = prisma
): Promise<FollowRequest[]> {
  const rows = await db.connection.findMany({
    where: { addresseeId: me, status: "PENDING" },
    include: { requester: { select: personSelect } },
    orderBy: { createdAt: "desc" },
    take,
  });
  const mutuals = await mutualsWith(
    me,
    rows.map((r) => r.requesterId),
    db
  );
  return rows.map((r) => ({
    connectionId: r.id,
    person: r.requester,
    createdAt: r.createdAt,
    mutuals: mutuals.get(r.requesterId) ?? { count: 0, sample: [] },
  }));
}

export type Suggestion = Person & { mutuals: Mutuals };

/** "Personas que quizá conozcas": solo quienes comparten algún conocido
 * conmigo y con quienes todavía no tengo ninguna relación ni solicitud. */
export async function suggestions(
  me: string,
  take = 12,
  db: Db = prisma
): Promise<Suggestion[]> {
  const rows = await db.connection.findMany({
    where: { OR: [{ requesterId: me }, { addresseeId: me }] },
    select: { requesterId: true, addresseeId: true, status: true },
    take: MAX_ROWS,
  });
  const other = (r: Link) => (r.requesterId === me ? r.addresseeId : r.requesterId);
  const skip = new Set([me, ...rows.map(other)]);
  const mine = rows.filter((r) => r.status === "ACCEPTED").map(other);

  // Candidato → conocidos míos con los que tiene relación.
  const found = new Map<string, string[]>();
  for (const [friend, linked] of await circles(mine, db)) {
    for (const candidate of linked) {
      if (skip.has(candidate)) continue;
      found.set(candidate, [...(found.get(candidate) ?? []), friend]);
    }
  }
  if (found.size === 0) return [];

  const best = [...found]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, take * 2);
  const people = await db.user.findMany({
    where: { id: { in: best.map(([id]) => id) }, isDeceased: false },
    select: personSelect,
  });
  const byId = new Map(people.map((p) => [p.id, p]));
  const chosen = best.filter(([id]) => byId.has(id)).slice(0, take);
  const mutuals = await describeMutuals(new Map(chosen), db);
  return chosen.map(([id]) => ({ ...byId.get(id)!, mutuals: mutuals.get(id)! }));
}

/** Mi relación hacia otra persona: no la sigo, pedí seguirla, o la sigo. */
export type FollowState = "none" | "sent" | "following";

export type Follow = { state: FollowState; connectionId: string | null };

export function followFromRow(
  row: { id: string; status: string } | null
): Follow {
  if (!row) return { state: "none", connectionId: null };
  return {
    state: row.status === "ACCEPTED" ? "following" : "sent",
    connectionId: row.id,
  };
}

/** Mi relación hacia `other`, vista desde `me`. */
export async function followBetween(
  me: string,
  other: string
): Promise<Follow> {
  const row = await prisma.connection.findFirst({
    where: { requesterId: me, addresseeId: other },
    select: { id: true, status: true },
  });
  return followFromRow(row);
}
