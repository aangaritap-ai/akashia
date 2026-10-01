"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotificationItem({
  id,
  title,
  body,
  linkUrl,
  createdAt,
  wasUnread,
}: {
  id: string;
  title: string;
  body: string;
  linkUrl: string | null;
  createdAt: string;
  wasUnread: boolean;
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function remove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (removing) return null;

  const card = (
    <div
      className={`relative rounded-xl border px-5 py-4 pr-11 shadow-sm ${
        wasUnread
          ? "border-accent/30 bg-accent/[0.06]"
          : "border-border bg-surface"
      }`}
    >
      <div className="font-semibold text-foreground">{title}</div>
      <div className="text-sm text-muted mt-1">{body}</div>
      <div className="text-xs text-muted mt-2">
        {new Date(createdAt).toLocaleDateString("es", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <button
        onClick={remove}
        aria-label="Borrar notificación"
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-muted hover:text-red-600 hover:bg-black/[0.04]"
      >
        ✕
      </button>
    </div>
  );

  return linkUrl ? <Link href={linkUrl}>{card}</Link> : card;
}
