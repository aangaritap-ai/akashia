"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { IconCamera } from "@/components/icons";
import { inputClass, primaryButtonClass } from "@/components/ui";

// Mismos límites que el servidor (src/lib/stories.ts). Se repiten aquí para
// avisar antes de subir; el servidor vuelve a validar.
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_CAPTION = 140;

export default function StoryComposer({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape" && !busy) onClose();
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

  function onPick(picked: File | null) {
    setError(null);
    if (!picked) return;
    if (!ALLOWED.includes(picked.type)) {
      setError("Usa una foto JPG, PNG, WebP o GIF.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError("La foto no puede pesar más de 5 MB.");
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(picked);
    previewRef.current = url;
    setFile(picked);
    setPreviewUrl(url);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Elige una foto primero.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("caption", caption);
      const res = await fetch("/api/stories", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo publicar la historia.");
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  // Se dibuja en <body> por la misma razón que el visor (ver StoryViewer).
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nueva historia"
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
            Nueva historia
          </h2>
          <p className="text-sm text-muted mt-1">
            Dura 24 horas. La ven tú y los seguidores que apruebes.
          </p>
        </div>

        <label className="relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background cursor-pointer overflow-hidden aspect-[3/4] hover:border-accent transition">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Vista previa de tu historia"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <IconCamera className="w-8 h-8 text-muted" />
              <span className="text-sm text-muted">Elegir una foto</span>
            </>
          )}
          <input
            type="file"
            accept={ALLOWED.join(",")}
            className="sr-only"
            aria-label="Elegir una foto"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
        </label>
        {previewUrl && (
          <p className="text-xs text-muted -mt-2">
            Toca la foto para cambiarla.
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="story-caption" className="text-sm font-medium text-foreground">
            Texto (opcional)
          </label>
          <textarea
            id="story-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
            rows={2}
            maxLength={MAX_CAPTION}
            placeholder="Escribe algo corto..."
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
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy || !file}
            className={primaryButtonClass}
          >
            {busy ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
