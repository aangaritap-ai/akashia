"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Avatar from "@/components/Avatar";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import { timeAgo } from "@/lib/format";
import type { StoryGroup } from "@/lib/stories";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.5C7 17 3 13.6 3 9.3A4.8 4.8 0 0 1 12 6.8a4.8 4.8 0 0 1 9 2.5c0 4.3-4 7.7-9 11.2z" />
    </svg>
  );
}

function Speaker({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      {muted ? (
        <path d="M16 9.5l5 5M21 9.5l-5 5" />
      ) : (
        <path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
      )}
    </svg>
  );
}

// Debe coincidir con la duración de .story-progress en globals.css.
const STORY_MS = 5000;

const arrowClass =
  "absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/70";

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
  const t = useTranslations("stories");
  const common = useTranslations("common");
  const time = useTranslations("time");
  const locale = useLocale();
  const [gi, setGi] = useState(startGroup);
  const [si, setSi] = useState(() => {
    const first = groups[startGroup].stories.findIndex((s) => !s.seen);
    return first === -1 ? 0 : first;
  });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Cambia para volver a empezar la historia que ya está en pantalla.
  const [restart, setRestart] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  // "Me gusta" que se ha cambiado mientras el visor está abierto.
  const [likedNow, setLikedNow] = useState<Record<string, boolean>>({});
  // Historia propia cuya lista de "me gusta" está abierta.
  const [likesFor, setLikesFor] = useState<string | null>(null);

  // Sonido de los videos y su avance (de 0 a 1), ligado a la historia.
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState({ key: "", value: 0 });
  // Videos que no cargaron: se muestran como foto, con su portada.
  const [broken, setBroken] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const group = groups[gi];
  const story = group.stories[si];
  const videoUrl = broken.includes(story.id) ? null : story.videoUrl;
  const playKey = `${story.id}-${restart}`;
  const showingLikes = likesFor === story.id;
  const paused = confirmingDelete || deleting || showingLikes;
  const liked = likedNow[story.id] ?? story.liked;
  const isFirst = gi === 0 && si === 0;

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
    } else {
      setRestart((n) => n + 1);
    }
  }

  async function remove() {
    setDeleting(true);
    await fetch(`/api/stories/${story.id}`, { method: "DELETE" }).catch(
      () => {}
    );
    close();
  }

  async function toggleLike() {
    const id = story.id;
    const value = !liked;
    // Se pinta enseguida y se deshace si el servidor no lo acepta.
    setLikedNow((m) => ({ ...m, [id]: value }));
    const res = await fetch(`/api/stories/${id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked: value }),
    }).catch(() => null);
    if (!res?.ok) setLikedNow((m) => ({ ...m, [id]: !value }));
  }

  const onTimeout = useEffectEvent(() => next());
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  });

  // Avance automático de las fotos; los videos avanzan al terminar.
  useEffect(() => {
    if (paused || videoUrl) return;
    const t = setTimeout(() => onTimeout(), STORY_MS);
    return () => clearTimeout(t);
  }, [gi, si, restart, paused, videoUrl]);

  // Reproduce o detiene el video. Si el navegador no deja reproducir con
  // sonido sin un toque, empieza en silencio.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
      return;
    }
    video.play().catch((err) => {
      if (err?.name !== "NotAllowedError") return;
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    });
  }, [playKey, paused, videoUrl]);

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
      aria-label={t("storyOf", { name: group.authorName })}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
    >
      <div className="relative w-full max-w-[420px] h-full sm:h-[min(92vh,760px)] sm:rounded-2xl overflow-hidden bg-black">
        {videoUrl ? (
          <video
            key={playKey}
            ref={videoRef}
            src={videoUrl}
            poster={story.imageUrl}
            muted={muted}
            playsInline
            preload="auto"
            aria-label={story.caption || t("storyOf", { name: group.authorName })}
            onTimeUpdate={(e) => {
              const { currentTime, duration } = e.currentTarget;
              if (duration > 0) {
                setPlayed({ key: playKey, value: currentTime / duration });
              }
            }}
            onEnded={next}
            onError={() => setBroken((ids) => [...ids, story.id])}
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.imageUrl}
            alt={story.caption || t("storyOf", { name: group.authorName })}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {/* Zonas de toque: izquierda = anterior, derecha = siguiente. Para
            teclado y lectores de pantalla están las flechas. */}
        <button
          type="button"
          onClick={prev}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1/3 z-0 cursor-w-resize"
        />
        <button
          type="button"
          onClick={next}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-2/3 z-0 cursor-e-resize"
        />

        {!isFirst && (
          <button
            type="button"
            onClick={prev}
            aria-label={t("previous")}
            className={`${arrowClass} left-2`}
          >
            <IconChevronLeft className="w-6 h-6" />
          </button>
        )}
        <button
          type="button"
          onClick={next}
          aria-label={t("next")}
          className={`${arrowClass} right-2`}
        >
          <IconChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute top-0 inset-x-0 z-10 p-3 pt-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <div className="flex gap-1.5">
            {group.stories.map((s, i) => (
              <div
                key={s.id}
                className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden"
              >
                {i < si ? (
                  <div className="h-full w-full bg-white" />
                ) : i === si && videoUrl ? (
                  <div
                    className="h-full w-full origin-left bg-white"
                    style={{
                      transform: `scaleX(${
                        played.key === playKey ? played.value : 0
                      })`,
                    }}
                  />
                ) : i === si ? (
                  <div
                    key={`${s.id}-${restart}-${paused}`}
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
                {group.isMine ? t("mine") : group.authorName}
              </div>
              <div className="text-xs text-white/70">
                {timeAgo(story.createdAt, locale, time("justNow"))}
              </div>
            </div>

            {group.isMine &&
              (confirmingDelete ? (
                <div className="flex items-center gap-2 text-xs text-white">
                  <span>{t("confirmDelete")}</span>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={deleting}
                    className="font-semibold text-red-300 hover:underline disabled:opacity-60"
                  >
                    {deleting ? common("deleting") : common("yes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="hover:underline"
                  >
                    {common("no")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="text-xs text-white/80 hover:text-white hover:underline"
                >
                  {common("delete")}
                </button>
              ))}

            {videoUrl && (
              <button
                type="button"
                onClick={() => setMuted(!muted)}
                aria-label={muted ? t("unmute") : t("mute")}
                className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/15"
              >
                <Speaker muted={muted} />
              </button>
            )}

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={t("close")}
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
          <div
            // En mis historias deja sitio al contador de "me gusta".
            className={`absolute bottom-0 inset-x-0 z-10 px-16 pt-12 ${
              group.isMine && story.likes.length > 0 ? "pb-20" : "pb-6"
            } bg-gradient-to-t from-black/80 to-transparent text-white text-center pointer-events-none`}
          >
            <p className="text-base leading-relaxed [overflow-wrap:anywhere]">
              {story.caption}
            </p>
          </div>
        )}

        {!group.isMine && (
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            aria-label={t("like")}
            className={`absolute bottom-4 right-3 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/70 ${
              liked ? "text-red-500" : "text-white"
            }`}
          >
            <Heart filled={liked} />
          </button>
        )}

        {group.isMine && story.likes.length > 0 && (
          <div className="absolute bottom-4 left-3 z-20 flex flex-col items-start gap-2">
            {showingLikes && (
              <ul className="max-h-56 w-60 overflow-y-auto rounded-xl bg-neutral-900 p-3 shadow-xl flex flex-col gap-2 text-white">
                {story.likes.map((person, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Avatar
                      name={person.name}
                      src={person.avatarUrl}
                      size="sm"
                    />
                    <span className="truncate">{person.name}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setLikesFor(showingLikes ? null : story.id)}
              aria-expanded={showingLikes}
              className="flex items-center gap-2 rounded-full bg-black/60 px-4 h-11 text-sm font-semibold text-white hover:bg-black/80"
            >
              <span className="text-red-500">
                <Heart filled />
              </span>
              {t("likes", { count: story.likes.length })}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
