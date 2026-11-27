"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { uploadPresigned } from "@vercel/blob/client";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import VideoRecorder, {
  type Recording,
} from "@/components/camera/VideoRecorder";
import { IconCamera, IconImage, IconVideo } from "@/components/icons";
import {
  cameraButtonClass,
  inputClass,
  primaryButtonClass,
} from "@/components/ui";
import { shrinkImage } from "@/lib/shrink-image";
import { MAX_UPLOAD_BYTES } from "@/lib/uploads";
import {
  MAX_STORY_VIDEO_BYTES,
  MAX_STORY_VIDEO_SECONDS,
  STORY_VIDEO_BITS,
  STORY_VIDEO_TYPES,
} from "@/lib/story-video";
import { readVideo } from "@/lib/video-poster";

// Mismos límites que el servidor (src/lib/stories.ts). Se repiten aquí para
// avisar antes de subir; el servidor vuelve a validar.
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_CAPTION = 140;

export default function StoryComposer({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const t = useTranslations("stories");
  const common = useTranslations("common");
  const camera = useTranslations("camera");
  const [recording, setRecording] = useState(false);
  const uploads = useTranslations("uploads");
  // La foto a publicar; en un video, su portada.
  const [file, setFile] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  // Avance de la subida del video.
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  // Número del último archivo elegido, para descartar uno anterior que tarde más.
  const pickRef = useRef(0);

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    // Con la cámara abierta, Escape solo la cierra a ella.
    if (e.key === "Escape" && !busy && !recording) onClose();
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function show(url: string) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
    setPreviewUrl(url);
  }

  async function pickVideo(picked: File) {
    if (picked.size > MAX_STORY_VIDEO_BYTES) {
      setError(t("videoTooBig"));
      return;
    }
    const turn = ++pickRef.current;
    setPreparing(true);
    const url = URL.createObjectURL(picked);
    const info = await readVideo(url).catch(() => null);
    const problem = !info
      ? t("videoUnreadable")
      : info.seconds > MAX_STORY_VIDEO_SECONDS + 0.5
        ? t("videoTooLong")
        : null;
    if (turn !== pickRef.current || problem || !info) {
      URL.revokeObjectURL(url);
      if (turn === pickRef.current) {
        setPreparing(false);
        setError(problem);
      }
      return;
    }
    setPreparing(false);
    show(url);
    setVideo(picked);
    setFile(new File([info.poster], "portada.jpg", { type: "image/jpeg" }));
  }

  /** Un video grabado aquí: ya viene con su portada y dentro del tiempo. */
  function onRecorded({ file: recorded, poster }: Recording) {
    setRecording(false);
    setError(null);
    if (recorded.size > MAX_STORY_VIDEO_BYTES) {
      setError(t("videoTooBig"));
      return;
    }
    pickRef.current++;
    setPreparing(false);
    show(URL.createObjectURL(recorded));
    setVideo(recorded);
    setFile(new File([poster], "portada.jpg", { type: "image/jpeg" }));
  }

  async function onPick(picked: File | null) {
    setError(null);
    if (!picked) return;
    if (picked.type in STORY_VIDEO_TYPES) return pickVideo(picked);
    if (!ALLOWED.includes(picked.type)) {
      setError(t("badType"));
      return;
    }
    const turn = ++pickRef.current;
    setPreparing(true);
    const ready = await shrinkImage(picked).catch(() => picked);
    if (turn !== pickRef.current) return;
    setPreparing(false);
    if (ready.size > MAX_UPLOAD_BYTES) {
      setError(uploads("tooBig"));
      return;
    }
    show(URL.createObjectURL(ready));
    setVideo(null);
    setFile(ready);
  }

  /** Sube el video directo al almacenamiento y devuelve su dirección. */
  async function uploadVideo(picked: File) {
    const check = await fetch("/api/upload/presign?para=historia");
    const info = await check.json().catch(() => ({}));
    if (!check.ok) throw new Error(info.error || t("publishFailed"));
    if (info.videosLeft <= 0) throw new Error(t("videoLimit"));
    const session = await fetch("/api/auth/session").then((r) => r.json());
    const extension = STORY_VIDEO_TYPES[picked.type];
    const blob = await uploadPresigned(
      `stories/${session?.user?.id}/video.${extension}`,
      picked,
      {
        access: "public",
        handleUploadUrl: "/api/upload/presign",
        contentType: picked.type,
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      }
    );
    return blob.url;
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError(t("pickFirst"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("caption", caption);
      if (video) form.append("videoUrl", await uploadVideo(video));
      const res = await fetch("/api/stories", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || t("publishFailed"));
        return;
      }
      router.refresh();
      onClose();
    } catch (err) {
      // Un fallo de red llega como TypeError, con un texto en inglés.
      setError(
        err instanceof TypeError
          ? common("offline")
          : err instanceof Error
            ? err.message
            : t("publishFailed")
      );
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  // Se dibuja en <body> por la misma razón que el visor (ver StoryViewer).
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("newStory")}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <form
        onSubmit={publish}
        className="w-full max-w-sm max-h-full overflow-y-auto rounded-2xl bg-surface p-5 shadow-xl flex flex-col gap-4"
      >
        <div>
          <h2 className="font-display font-medium text-2xl text-foreground">
            {t("newStory")}
          </h2>
          <p className="text-sm text-muted mt-1">
            {t("newStoryHint")}
          </p>
        </div>

        <label className="relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background cursor-pointer overflow-hidden aspect-[3/4] hover:border-accent transition">
          {previewUrl && video ? (
            <video
              src={previewUrl}
              muted
              loop
              autoPlay
              playsInline
              aria-label={t("previewAlt")}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={t("previewAlt")}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <IconImage className="w-8 h-8 text-muted" />
              <span className="text-sm text-muted">
                {preparing ? t("preparing") : t("choosePhoto")}
              </span>
            </>
          )}
          <input
            type="file"
            accept={[...ALLOWED, ...Object.keys(STORY_VIDEO_TYPES)].join(",")}
            className="sr-only"
            aria-label={t("choosePhoto")}
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
        </label>
        <p className="text-xs text-muted -mt-2">
          {previewUrl ? t("changePhoto") : t("videoLimits")}
        </p>

        <div className="flex gap-2 -mt-1">
          {/* "capture" abre la cámara solo en celulares y tabletas. */}
          <label
            className={`${cameraButtonClass} flex-1 pointer-fine:hidden`}
          >
            <IconCamera className="w-5 h-5" />
            {camera("takePhoto")}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const taken = e.target.files?.[0] ?? null;
                e.target.value = "";
                onPick(taken);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setRecording(true)}
            disabled={busy}
            className={`${cameraButtonClass} flex-1`}
          >
            <IconVideo className="w-5 h-5" />
            {camera("recordVideo")}
          </button>
        </div>
        {recording && (
          <VideoRecorder
            maxSeconds={MAX_STORY_VIDEO_SECONDS}
            videoBitsPerSecond={STORY_VIDEO_BITS}
            onDone={onRecorded}
            onClose={() => setRecording(false)}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="story-caption" className="text-sm font-medium text-foreground">
            {t("captionLabel")}
          </label>
          <textarea
            id="story-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
            rows={2}
            maxLength={MAX_CAPTION}
            placeholder={t("captionPlaceholder")}
            className={`${inputClass} resize-none`}
          />
          <div className="text-xs text-muted text-right">
            {caption.length}/{MAX_CAPTION}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-sm text-muted hover:underline disabled:opacity-50"
          >
            {common("cancel")}
          </button>
          <button
            type="submit"
            disabled={busy || preparing || !file}
            className={primaryButtonClass}
          >
            {busy
              ? progress > 0 && progress < 100
                ? t("uploadingVideo", { percent: progress })
                : t("publishing")
              : preparing
                ? t("preparing")
                : t("publish")}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
