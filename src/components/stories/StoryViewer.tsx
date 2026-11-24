"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { timeAgo } from "@/lib/format";
import type { StoryGroup } from "@/lib/stories";

// Debe coincidir con la duración de .story-progress en globals.css.
const STORY_MS = 5000;

export default function StoryViewer({
  groups,
  startGroup,
  onClose,
}: {
  groups: StoryGroup[];
  startGroup: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [gi, setGi] = useState(startGroup);
  const [si, setSi] = useState(() => {
    const first = groups[startGroup].stories.findIndex((s) => !s.seen);
    return first === -1 ? 0 : first;
  });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const group = groups[gi];
  const story = group.stories[si];
  const paused = confirmingDelete || deleting;

  function close() {
    onClose();
    router.refresh(); // actualiza los aros de "visto / sin ver"
  }

  function next() {
    if (si < group.stories.length - 1) {
      setSi(si + 1);
    } else if (gi < groups.length - 1) {
      setGi(gi + 1);
      setSi(0);
    } else {
      close();
    }
  }

  function prev() {
    if (si > 0) {
      setSi(si - 1);
    } else if (gi > 0) {
      setGi(gi - 1);
      setSi(groups[gi - 1].stories.length - 1);
    }
  }

  async function remove() {
    setDeleting(true);
    await fetch(`/api/stories/${story.id}`, { method: "DELETE" }).catch(
      () => {}
    );
    close();
  }

  const onTimeout = useEffectEvent(() => next());
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  });

  // Avance automático.
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => onTimeout(), STORY_MS);
    return () => clearTimeout(t);
  }, [gi, si, paused]);

  // Marca como vista la historia que se está mostrando.
  useEffect(() => {
    if (group.isMine || story.seen) return;
    fetch(`/api/stories/${story.id}/view`, { method: "POST" }).catch(() => {});
  }, [story.id, story.seen, group.isMine]);

  // Teclado, bloqueo del scroll de fondo y foco inicial.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Se dibuja en <body> (no dentro de la barra de historias): la animación
  // .reveal deja una transformación en el contenedor y eso haría que
  // "fixed" se midiera contra él en vez de contra la ventana.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Historia de ${group.authorName}`}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
    >
      <div className="relative w-full max-w-[420px] h-full sm:h-[min(92vh,760px)] sm:rounded-2xl overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={story.imageUrl}
          alt={story.caption || `Historia de ${group.authorName}`}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Zonas de toque: izquierda = anterior, derecha = siguiente */}
        <button
          type="button"
          onClick={prev}
          aria-label="Historia anterior"
          className="absolute inset-y-0 left-0 w-1/3 z-0 cursor-w-resize"
        />
        <button
          type="button"
          onClick={next}
          aria-label="Siguiente historia"
          className="absolute inset-y-0 right-0 w-2/3 z-0 cursor-e-resize"
        />

        <div className="absolute top-0 inset-x-0 z-10 p-3 pt-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <div className="flex gap-1.5">
            {group.stories.map((s, i) => (
              <div
                key={s.id}
                className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden"
              >
                {i < si ? (
                  <div className="h-full w-full bg-white" />
                ) : i === si ? (
                  <div
                    key={`${s.id}-${paused}`}
                    className="story-progress h-full w-full bg-white"
                    style={{
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3 pointer-events-auto">
            <Avatar
              name={group.authorName}
              src={group.authorAvatarUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1 text-white">
              <div className="text-sm font-semibold truncate">
                {group.isMine ? "Tu historia" : group.authorName}
              </div>
              <div className="text-xs text-white/70">
                {timeAgo(story.createdAt)}
              </div>
            </div>

            {group.isMine &&
              (confirmingDelete ? (
                <div className="flex items-center gap-2 text-xs text-white">
                  <span>¿Borrar?</span>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={deleting}
                    className="font-semibold text-red-300 hover:underline disabled:opacity-60"
                  >
                    {deleting ? "Borrando..." : "Sí"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="hover:underline"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="text-xs text-white/80 hover:text-white hover:underline"
                >
                  Borrar
                </button>
              ))}

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/15"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        {story.caption && (
          <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-6 pt-12 bg-gradient-to-t from-black/80 to-transparent text-white text-center pointer-events-none">
            <p className="text-base leading-relaxed [overflow-wrap:anywhere]">
              {story.caption}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
