"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Avatar from "@/components/Avatar";
import { useAccountGate } from "@/components/posts/useAccountGate";
import { inputClass, primaryButtonClass } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { MAX_COMMENT, type CommentView } from "@/lib/posts";

/** La lista de comentarios de una publicación y el campo para escribir. */
export default function Comments({
  messageId,
  signedIn,
  onCount,
}: {
  messageId: string;
  signedIn: boolean;
  onCount: (count: number) => void;
}) {
  const t = useTranslations("comments");
  const common = useTranslations("common");
  const time = useTranslations("time");
  const locale = useLocale();
  const gate = useAccountGate(messageId);
  const [comments, setComments] = useState<CommentView[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // El comentario que se está por borrar.
  const [confirming, setConfirming] = useState<string | null>(null);
  const report = useRef(onCount);

  useEffect(() => {
    report.current = onCount;
  });

  useEffect(() => {
    let alive = true;
    fetch(`/api/messages/${messageId}/comments`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!alive) return;
        setComments(data.comments);
        report.current(data.comments.length);
      })
      .catch(() => alive && setLoadFailed(true));
    return () => {
      alive = false;
    };
  }, [messageId]);

  function show(next: CommentView[]) {
    setComments(next);
    onCount(next.length);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/messages/${messageId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.comment) {
        show([...(comments ?? []), data.comment]);
        setText("");
      } else if (!gate(res.status)) {
        setError(data?.error || t("failed"));
      }
    } catch {
      setError(common("offline"));
    }
    setBusy(false);
  }

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      // Un 404 es que ya no estaba.
      if (res.ok || res.status === 404) {
        show((comments ?? []).filter((c) => c.id !== id));
        setConfirming(null);
      } else if (!gate(res.status)) {
        setError(t("failed"));
      }
    } catch {
      setError(common("offline"));
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {loadFailed ? (
        <p role="alert" className="text-sm text-red-600">
          {t("loadFailed")}
        </p>
      ) : comments === null ? (
        <p className="text-sm text-muted">{common("loading")}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-2.5">
              <Avatar name={c.author.name} src={c.author.avatarUrl} size="sm" />
              <div className="min-w-0">
                <div className="rounded-2xl bg-black/[0.04] px-3 py-2">
                  <Link
                    href={`/memorial/${c.author.id}`}
                    className="text-sm font-semibold text-foreground hover:underline"
                  >
                    {c.author.name}
                  </Link>
                  <p className="text-sm leading-relaxed whitespace-pre-line [overflow-wrap:anywhere] text-foreground">
                    {c.text}
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 px-3 text-xs text-muted">
                  <span>{timeAgo(c.createdAt, locale, time("justNow"))}</span>
                  {c.canDelete &&
                    (confirming === c.id ? (
                      <>
                        <span className="text-red-700">
                          {t("confirmDelete")}
                        </span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => remove(c.id)}
                          className="font-semibold text-red-600 hover:underline disabled:opacity-50"
                        >
                          {t("yesDelete")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(null)}
                          className="hover:underline"
                        >
                          {common("cancel")}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirming(c.id)}
                        className="hover:text-red-600 hover:underline"
                      >
                        {common("delete")}
                      </button>
                    ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {signedIn ? (
        <form onSubmit={send} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_COMMENT}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className={`${primaryButtonClass} shrink-0`}
          >
            {t("send")}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => gate(401)}
          className="self-start text-sm font-semibold text-accent hover:underline"
        >
          {t("signIn")}
        </button>
      )}
    </div>
  );
}
