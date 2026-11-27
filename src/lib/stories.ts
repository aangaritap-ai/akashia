import { del } from "@vercel/blob";
import type { Prisma } from "@prisma/client";
import { MAX_UPLOAD_BYTES } from "@/lib/uploads";
import { prisma } from "@/lib/prisma";
import { getFollowingIds, isFollowing } from "@/lib/connections";

export const STORY_HOURS = 24;
export const MAX_CAPTION = 140;
export const MAX_STORY_IMAGE_BYTES = MAX_UPLOAD_BYTES;
export const MAX_ACTIVE_STORIES = 20; // por persona
export const STORY_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type StoryDTO = {
  id: string;
  /** La foto; en los videos, su portada. */
  imageUrl: string;
  videoUrl: string | null;
  caption: string | null;
  createdAt: string;
  seen: boolean;
  /** Si quien mira le dio "me gusta". */
  liked: boolean;
  /** A quiénes les gustó; solo se llena en las historias propias. */
  likes: { name: string; avatarUrl: string | null }[];
};

export type StoryGroup = {
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  isMine: boolean;
  hasUnseen: boolean;
  stories: StoryDTO[];
};

/** Historias activas (no vencidas) que `userId` puede ver: las suyas y las de
 * las personas que sigue (con aprobación), agrupadas por autor. Mías primero;
 * luego las que tienen historias sin ver; luego por la más reciente. */
export async function getVisibleStories(userId: string): Promise<StoryGroup[]> {
  const followingIds = await getFollowingIds(userId);

  const stories = await prisma.story.findMany({
    where: {
      authorId: { in: [userId, ...followingIds] },
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      views: { where: { viewerId: userId }, select: { likedAt: true } },
    },
  });

  // Quién dio "me gusta" se consulta aparte y solo para mis historias.
  const myLikes = await prisma.storyView.findMany({
    where: {
      likedAt: { not: null },
      storyId: {
        in: stories.filter((s) => s.authorId === userId).map((s) => s.id),
      },
    },
    orderBy: { likedAt: "desc" },
    select: {
      storyId: true,
      viewer: { select: { name: true, avatarUrl: true } },
    },
  });

  const groups = new Map<string, StoryGroup>();
  for (const s of stories) {
    const isMine = s.authorId === userId;
    let group = groups.get(s.authorId);
    if (!group) {
      group = {
        authorId: s.authorId,
        authorName: s.author.name,
        authorAvatarUrl: s.author.avatarUrl,
        isMine,
        hasUnseen: false,
        stories: [],
      };
      groups.set(s.authorId, group);
    }
    // Las propias nunca cuentan como "sin ver".
    const seen = isMine || s.views.length > 0;
    if (!seen) group.hasUnseen = true;
    group.stories.push({
      id: s.id,
      imageUrl: s.imageUrl,
      videoUrl: s.videoUrl,
      caption: s.caption,
      createdAt: s.createdAt.toISOString(),
      seen,
      liked: Boolean(s.views[0]?.likedAt),
      likes: myLikes.filter((l) => l.storyId === s.id).map((l) => l.viewer),
    });
  }

  const latest = (g: StoryGroup) => g.stories[g.stories.length - 1].createdAt;
  return [...groups.values()].sort((a, b) => {
    if (a.isMine !== b.isMine) return a.isMine ? -1 : 1;
    if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
    return latest(b).localeCompare(latest(a));
  });
}

/** Única regla de visibilidad: la historia no venció y quien mira es el
 * autor o lo sigue (con su aprobación). */
export async function canViewStory(
  viewerId: string,
  story: { authorId: string; expiresAt: Date }
): Promise<boolean> {
  if (story.expiresAt.getTime() <= Date.now()) return false;
  if (viewerId === story.authorId) return true;
  return isFollowing(viewerId, story.authorId);
}

/**
 * Pone o quita el "me gusta" de una persona. La primera vez avisa al autor.
 * Quien llama ya comprobó que puede ver la historia y que no es la suya.
 */
export async function setStoryLike(
  like: {
    storyId: string;
    authorId: string;
    viewerId: string;
    viewerName: string;
    liked: boolean;
  },
  db: Prisma.TransactionClient = prisma
) {
  const { storyId, viewerId, liked } = like;
  const likedAt = liked ? new Date() : null;
  // Primero la fila (puede estar creándose a la vez al marcarla como vista).
  await db.storyView.createMany({
    data: [{ storyId, viewerId }],
    skipDuplicates: true,
  });
  await db.storyView.update({
    where: { storyId_viewerId: { storyId, viewerId } },
    data: { likedAt },
  });
  if (!liked) return;

  // Solo avisa quien logra marcar "ya avisado": dos toques seguidos no
  // duplican la notificación.
  const claimed = await db.storyView.updateMany({
    where: { storyId, viewerId, likeNotified: false },
    data: { likeNotified: true },
  });
  if (claimed.count === 0) return;
  await db.notification.create({
    data: {
      userId: like.authorId,
      actorId: viewerId,
      type: "STORY_LIKE",
      title: "Nuevo me gusta",
      body: `A ${like.viewerName} le gustó tu historia.`,
      linkUrl: "/inicio",
    },
  });
}

/** Borra las historias vencidas y sus fotos. Lo llama el cron diario; la
 * consulta de arriba ya oculta lo vencido, así que esto solo libera espacio. */
export async function cleanupExpiredStories(): Promise<number> {
  const expired = await prisma.story.findMany({
    where: { expiresAt: { lte: new Date() } },
    select: { id: true, imageUrl: true, videoUrl: true },
    take: 500,
  });
  if (expired.length === 0) return 0;

  try {
    await del(
      expired.flatMap((s) => [s.imageUrl, ...(s.videoUrl ? [s.videoUrl] : [])])
    );
  } catch (err) {
    // Si falla el borrado de archivos, se deja la fila para reintentar mañana.
    console.error(
      "[Akashia] No se pudieron borrar fotos de historias vencidas:",
      err instanceof Error ? err.message : err
    );
    return 0;
  }

  await prisma.story.deleteMany({
    where: { id: { in: expired.map((s) => s.id) } },
  });
  return expired.length;
}
