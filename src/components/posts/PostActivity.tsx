"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { IconComment } from "@/components/icons";
import Comments from "@/components/posts/Comments";
import ReactionButton from "@/components/posts/ReactionButton";
import { postAnchor, type Activity } from "@/lib/posts";

function onHashChange(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

/** La barra de abajo de una publicación: reaccionar y comentar. */
export default function PostActivity({
  messageId,
  initial,
  signedIn,
  children,
}: {
  messageId: string;
  initial: Activity;
  signedIn: boolean;
  /** Lo que va a la derecha (borrar la publicación). */
  children?: ReactNode;
}) {
  const t = useTranslations("comments");
  const [count, setCount] = useState(initial.comments);
  // Al llegar desde un aviso, los comentarios ya salen abiertos.
  const linked = useSyncExternalStore(
    onHashChange,
    () => window.location.hash === `#${postAnchor(messageId)}`,
    () => false
  );
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? (linked && initial.comments > 0);

  return (
    <div className="mt-4 border-t border-border">
      <div className="px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <ReactionButton
          messageId={messageId}
          initial={initial.reactions}
          signedIn={signedIn}
        />
        <button
          type="button"
          onClick={() => setToggled(!open)}
          aria-expanded={open}
          aria-label={t("toggle", { count })}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
            open
              ? "border-accent text-accent"
              : "border-border text-muted hover:bg-black/[0.03]"
          }`}
        >
          <IconComment className="w-[18px] h-[18px]" />
          <span>{count}</span>
        </button>
        {children && <div className="ml-auto">{children}</div>}
      </div>
      {open && (
        <div className="px-5 pb-4">
          <Comments
            messageId={messageId}
            signedIn={signedIn}
            onCount={setCount}
          />
        </div>
      )}
    </div>
  );
}
