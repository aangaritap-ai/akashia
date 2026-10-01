"use client";

import { useEffect, useState } from "react";

type ReactionType = "HEART" | "CONDOLENCES" | "CONGRATS" | "SAD";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "HEART", emoji: "❤️", label: "Me encanta" },
  { type: "CONDOLENCES", emoji: "🕊️", label: "Pésame" },
  { type: "CONGRATS", emoji: "🎉", label: "Felicitaciones" },
  { type: "SAD", emoji: "😢", label: "Tristeza" },
];

export default function ReactionBar({
  messageId,
  initialCounts,
}: {
  messageId: string;
  initialCounts: {
    heartCount: number;
    condolencesCount: number;
    congratsCount: number;
    sadCount: number;
  };
}) {
  const [counts, setCounts] = useState({
    HEART: initialCounts.heartCount,
    CONDOLENCES: initialCounts.condolencesCount,
    CONGRATS: initialCounts.congratsCount,
    SAD: initialCounts.sadCount,
  });
  const [mine, setMine] = useState<Set<ReactionType>>(new Set());
  const storageKey = `akashia-reactions-${messageId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setMine(new Set(JSON.parse(saved)));
    } catch {
      // localStorage can be unavailable (private mode); reactions just
      // won't remember as "mine" across reloads for this viewer.
    }
  }, [storageKey]);

  async function toggle(type: ReactionType) {
    const alreadyMine = mine.has(type);
    const action = alreadyMine ? "remove" : "add";

    const nextMine = new Set(mine);
    if (alreadyMine) nextMine.delete(type);
    else nextMine.add(type);
    setMine(nextMine);
    setCounts((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + (alreadyMine ? -1 : 1)),
    }));

    try {
      localStorage.setItem(storageKey, JSON.stringify([...nextMine]));
    } catch {
      // ignore
    }

    try {
      await fetch(`/api/reactions/${messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action }),
      });
    } catch {
      // best-effort; the optimistic local count stands even if this
      // particular request drops (e.g. a flaky connection)
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REACTIONS.map((r) => {
        const active = mine.has(r.type);
        const count = counts[r.type];
        return (
          <button
            key={r.type}
            type="button"
            onClick={() => toggle(r.type)}
            aria-label={r.label}
            title={r.label}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border transition ${
              active
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted hover:bg-black/[0.03]"
            }`}
          >
            <span>{r.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
