"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAccountGate } from "@/components/posts/useAccountGate";
import {
  emojiFor,
  REACTIONS,
  totalReactions,
  withMine,
  type ReactionKind,
  type ReactionSummary,
} from "@/lib/posts";

const OPEN_AFTER = 250;
const CLOSE_AFTER = 350;
const HOLD = 450;

/**
 * Un corazón con el número de reacciones. Un toque pone o quita el corazón; al
 * pasar el ratón, mantener presionado o llegar con el teclado, salen las demás.
 */
export default function ReactionButton({
  messageId,
  initial,
  signedIn,
}: {
  messageId: string;
  initial: ReactionSummary;
  signedIn: boolean;
}) {
  const t = useTranslations("messages");
  const gate = useAccountGate(messageId);
  const [summary, setSummary] = useState(initial);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  // Se mantuvo presionado: ese toque abre las opciones y no cuenta como clic.
  const held = useRef(false);
  // Al volver el foco con Escape, las opciones no deben abrirse otra vez.
  const quiet = useRef(false);
  // Solo vale la respuesta de la última petición.
  const sent = useRef(0);

  function wait(ms: number, then: () => void) {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(then, ms);
  }
  function stopWaiting() {
    window.clearTimeout(timer.current);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Un toque fuera cierra las opciones.
  useEffect(() => {
    if (!open) return;
    function outside(e: PointerEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  async function react(type: ReactionKind | null) {
    stopWaiting();
    setOpen(false);
    setFailed(false);
    if (!signedIn) {
      gate(401);
      return;
    }
    const before = summary;
    const turn = ++sent.current;
    setSummary(withMine(before, type));
    try {
      const res = await fetch(`/api/reactions/${messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json().catch(() => null);
      if (turn !== sent.current) return;
      if (res.ok && data?.reactions) {
        setSummary(data.reactions);
        return;
      }
      setSummary(before);
      if (!gate(res.status)) setFailed(true);
    } catch {
      if (turn !== sent.current) return;
      setSummary(before);
      setFailed(true);
    }
  }

  const { mine, counts } = summary;
  const shown = mine ?? "HEART";
  const total = totalReactions(counts);
  const others = REACTIONS.filter((r) => r.type !== shown && counts[r.type] > 0);
  const label = REACTIONS.find((r) => r.type === shown)!.label;

  return (
    <div className="flex items-center gap-2">
      <div
        ref={box}
        className="relative"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") wait(OPEN_AFTER, () => setOpen(true));
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") {
            wait(CLOSE_AFTER, () => setOpen(false));
          }
        }}
        onBlur={(e) => {
          if (
            e.relatedTarget &&
            !e.currentTarget.contains(e.relatedTarget as Node)
          ) {
            setOpen(false);
          }
        }}
        onKeyDown={(e) => {
          held.current = false;
          if (e.key === "Escape" && open) {
            setOpen(false);
            if (document.activeElement !== main.current) {
              quiet.current = true;
              main.current?.focus();
            }
          }
        }}
      >
        <button
          ref={main}
          type="button"
          aria-pressed={mine !== null}
          aria-label={t("reactionButton", { name: t(label), count: total })}
          onPointerDown={(e) => {
            held.current = false;
            if (e.pointerType !== "mouse") {
              wait(HOLD, () => {
                held.current = true;
                setOpen(true);
              });
            }
          }}
          onPointerUp={(e) => {
            if (e.pointerType !== "mouse") stopWaiting();
          }}
          onPointerCancel={stopWaiting}
          onContextMenu={(e) => e.preventDefault()}
          onFocus={(e) => {
            if (quiet.current) {
              quiet.current = false;
              return;
            }
            if (e.currentTarget.matches(":focus-visible")) setOpen(true);
          }}
          onClick={() => {
            if (held.current) {
              held.current = false;
              return;
            }
            react(mine ? null : "HEART");
          }}
          className={`flex select-none touch-manipulation items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition [-webkit-touch-callout:none] ${
            mine
              ? "border-accent bg-accent/15 font-semibold text-accent"
              : "border-border text-muted hover:bg-black/[0.03]"
          }`}
        >
          <span aria-hidden="true">{emojiFor(shown)}</span>
          <span>{total}</span>
        </button>

        {open && (
          // El relleno de abajo evita que se cierre al subir el ratón.
          <div className="absolute bottom-full left-0 z-30 pb-2">
            <div
              role="group"
              aria-label={t("chooseReaction")}
              className="flex gap-1 rounded-full border border-border bg-surface p-1.5 shadow-lg"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  onClick={() => react(mine === r.type ? null : r.type)}
                  aria-label={t(r.label)}
                  aria-pressed={mine === r.type}
                  title={t(r.label)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-transform hover:scale-125 focus-visible:scale-125 ${
                    mine === r.type ? "bg-accent/15" : ""
                  }`}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {others.length > 0 && (
        <span className="flex gap-0.5 text-sm">
          {others.map((r) => (
            <span
              key={r.type}
              role="img"
              aria-label={`${t(r.label)}: ${counts[r.type]}`}
              title={`${t(r.label)}: ${counts[r.type]}`}
            >
              {r.emoji}
            </span>
          ))}
        </span>
      )}

      {failed && (
        <span role="alert" className="text-xs text-red-600">
          {t("reactionFailed")}
        </span>
      )}
    </div>
  );
}
