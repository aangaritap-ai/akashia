import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  emptySummary,
  postLink,
  type Activity,
  type CommentView,
  type ReactionKind,
} from "@/lib/posts";

type Db = Prisma.TransactionClient;

export type Post = { id: string; ownerId: string; petId: string | null };

const MAX_LISTED = 200;
const personSelect = { id: true, name: true, avatarUrl: true } as const;

/**
 * Única regla de visibilidad: una publicación privada solo la ve (y solo la
 * comenta o reacciona) el dueño de la página.
 */
export function findVisiblePost(
  messageId: string,
  viewerId: string | null,
  db: Db = prisma
): Promise<Post | null> {
  return db.memorialMessage.findFirst({
    where: {
      id: messageId,
      OR: [{ isPublic: true }, ...(viewerId ? [{ ownerId: viewerId }] : [])],
    },
    select: { id: true, ownerId: true, petId: true },
  });
}

/** Agrega a cada publicación sus reacciones y cuántos comentarios tiene. */
export async function withActivity<T extends { id: string }>(
  posts: T[],
  viewerId: string | null,
  db: Db = prisma
): Promise<(T & { activity: Activity })[]> {
  const ids = posts.map((p) => p.id);
  if (ids.length === 0) return [];

  // Una consulta tras otra: dentro de una transacción no pueden ir a la vez.
  const reactions = await db.postReaction.groupBy({
    by: ["messageId", "type"],
    where: { messageId: { in: ids }, type: { not: null } },
    _count: { _all: true },
  });
  const mine = viewerId
    ? await db.postReaction.findMany({
        where: {
          messageId: { in: ids },
          userId: viewerId,
          type: { not: null },
        },
        select: { messageId: true, type: true },
      })
    : [];
  const comments = await db.postComment.groupBy({
    by: ["messageId"],
    where: { messageId: { in: ids } },
    _count: { _all: true },
  });

  const activity = new Map<string, Activity>(
    ids.map((id) => [id, { reactions: emptySummary(), comments: 0 }])
  );
  for (const row of reactions) {
    activity.get(row.messageId)!.reactions.counts[row.type!] = row._count._all;
  }
  for (const row of mine) {
    activity.get(row.messageId)!.reactions.mine = row.type;
  }
  for (const row of comments) {
    activity.get(row.messageId)!.comments = row._count._all;
  }
  return posts.map((p) => ({ ...p, activity: activity.get(p.id)! }));
}

/**
 * Pone, cambia o quita la reacción de una persona. La primera vez avisa al
 * dueño. Quien llama ya comprobó que puede ver la publicación.
 */
export async function setReaction(
  reaction: {
    post: Post;
    userId: string;
    userName: string;
    type: ReactionKind | null;
  },
  db: Db = prisma
) {
  const { post, userId, type } = reaction;
  const key = { messageId: post.id, userId };
  // Primero la fila: dos toques a la vez no crean dos.
  await db.postReaction.createMany({ data: [key], skipDuplicates: true });
  await db.postReaction.update({
    where: { messageId_userId: key },
    data: { type },
  });

  if (type && post.ownerId !== userId) {
    // Solo avisa quien logra marcar "ya avisado".
    const claimed = await db.postReaction.updateMany({
      where: { ...key, notified: false },
      data: { notified: true },
    });
    if (claimed.count > 0) {
      await db.notification.create({
        data: {
          userId: post.ownerId,
          actorId: userId,
          messageId: post.id,
          type: "POST_REACTION",
          title: "Nueva reacción",
          body: `${reaction.userName} reaccionó a tu publicación.`,
          linkUrl: postLink(post),
        },
      });
    }
  }

  const [updated] = await withActivity([{ id: post.id }], userId, db);
  return updated.activity.reactions;
}

/** Guarda un comentario y avisa al dueño de la publicación. */
export async function addComment(
  comment: { post: Post; userId: string; text: string },
  db: Db = prisma
): Promise<CommentView> {
  const { post, userId, text } = comment;
  const created = await db.postComment.create({
    data: { messageId: post.id, userId, text },
    include: { user: { select: personSelect } },
  });
  if (post.ownerId !== userId) {
    await db.notification.create({
      data: {
        userId: post.ownerId,
        actorId: userId,
        messageId: post.id,
        commentId: created.id,
        type: "POST_COMMENT",
        title: "Nuevo comentario",
        body: `${created.user.name} comentó tu publicación.`,
        linkUrl: postLink(post),
      },
    });
  }
  return {
    id: created.id,
    text: created.text,
    createdAt: created.createdAt.toISOString(),
    author: created.user,
    canDelete: true,
  };
}

/** Los comentarios de una publicación, del más antiguo al más nuevo. */
export async function listComments(
  post: Post,
  viewerId: string | null,
  db: Db = prisma
): Promise<CommentView[]> {
  const rows = await db.postComment.findMany({
    where: { messageId: post.id },
    include: { user: { select: personSelect } },
    // Si hay demasiados, se muestran los más recientes.
    orderBy: { createdAt: "desc" },
    take: MAX_LISTED,
  });
  return rows.reverse().map((c) => ({
    id: c.id,
    text: c.text,
    createdAt: c.createdAt.toISOString(),
    author: c.user,
    canDelete: viewerId === c.userId || viewerId === post.ownerId,
  }));
}

/** Lo borra quien lo escribió o el dueño de la publicación; su aviso también. */
export async function deleteComment(
  commentId: string,
  userId: string,
  db: Db = prisma
) {
  const result = await db.postComment.deleteMany({
    where: {
      id: commentId,
      OR: [{ userId }, { message: { ownerId: userId } }],
    },
  });
  return result.count > 0;
}
