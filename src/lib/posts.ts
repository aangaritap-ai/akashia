// Reacciones y comentarios de las publicaciones. Sin dependencias de servidor:
// lo usan las pantallas y la API.

export const REACTIONS = [
  { type: "HEART", emoji: "❤️", label: "love" },
  { type: "CONDOLENCES", emoji: "🕊️", label: "condolences" },
  { type: "CONGRATS", emoji: "🎉", label: "congrats" },
  { type: "SAD", emoji: "😢", label: "sad" },
] as const;

export type ReactionKind = (typeof REACTIONS)[number]["type"];

export const MAX_COMMENT = 500;

export type ReactionSummary = {
  counts: Record<ReactionKind, number>;
  /** La reacción de quien mira, si tiene una. */
  mine: ReactionKind | null;
};

export type Activity = { reactions: ReactionSummary; comments: number };

export type CommentView = {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  /** Lo escribió quien mira, o es el dueño de la publicación. */
  canDelete: boolean;
};

export function emptySummary(): ReactionSummary {
  return {
    counts: { HEART: 0, CONDOLENCES: 0, CONGRATS: 0, SAD: 0 },
    mine: null,
  };
}

export function emojiFor(type: ReactionKind) {
  return REACTIONS.find((r) => r.type === type)!.emoji;
}

export function totalReactions(counts: ReactionSummary["counts"]) {
  return Object.values(counts).reduce((sum, n) => sum + n, 0);
}

/** Cómo quedará al cambiar la reacción propia (para mostrarlo de una vez). */
export function withMine(
  summary: ReactionSummary,
  next: ReactionKind | null
): ReactionSummary {
  const counts = { ...summary.counts };
  if (summary.mine) {
    counts[summary.mine] = Math.max(0, counts[summary.mine] - 1);
  }
  if (next) counts[next] += 1;
  return { counts, mine: next };
}

/** El elemento de la página donde está una publicación. */
export function postAnchor(messageId: string) {
  return `m-${messageId}`;
}

/** Dirección de una publicación, para los avisos. */
export function postLink(post: {
  id: string;
  ownerId: string;
  petId: string | null;
}) {
  const page = post.petId
    ? `/huellitas/${post.petId}`
    : `/memorial/${post.ownerId}`;
  return `${page}#${postAnchor(post.id)}`;
}
