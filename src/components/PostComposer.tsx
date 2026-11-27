"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Avatar from "@/components/Avatar";
import { IconCamera } from "@/components/icons";
import { inputClass, primaryButtonClass } from "@/components/ui";
import { useRouter } from "@/i18n/navigation";
import { shrinkImage } from "@/lib/shrink-image";
import { MAX_UPLOAD_BYTES } from "@/lib/uploads";

type Me = { id: string; name: string; avatarUrl: string | null };

const MAX_LENGTH = 2000;

// "Crear publicación": escribe en la propia página; si es pública, aparece en el
// feed.
export default function PostComposer({ me }: { me: Me }) {
  const router = useRouter();
  const t = useTranslations("composer");
  const common = useTranslations("common");
  const messages = useTranslations("messages");
  const uploads = useTranslations("uploads");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"posted" | "savedPrivate" | null>(null);

  function pick(file: File | null) {
    if (!file) return;
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhoto({ file, preview: URL.createObjectURL(file) });
    setError(null);
    setDone(null);
    setOpen(true);
  }

  function removePhoto() {
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhoto(null);
  }

  function reset() {
    removePhoto();
    setText("");
    setIsPublic(true);
    setError(null);
    setOpen(false);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let imageUrl: string | null = null;
      if (photo) {
        const ready = await shrinkImage(photo.file);
        if (ready.size > MAX_UPLOAD_BYTES) throw new Error(uploads("tooBig"));
        const form = new FormData();
        form.append("file", ready);
        const res = await fetch("/api/memorial/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || messages("uploadFailed"));
        imageUrl = data.url;
      }

      const res = await fetch(`/api/memorial/${me.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: me.name.slice(0, 80),
          message: text,
          imageUrl,
          isPublic,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("failed"));
      }

      reset();
      setDone(isPublic ? "posted" : "savedPrivate");
      router.refresh();
    } catch (err) {
      // Un fallo de red llega como TypeError, con un texto en inglés.
      setError(
        err instanceof TypeError
          ? common("offline")
          : err instanceof Error
            ? err.message
            : t("failed")
      );
    } finally {
      setBusy(false);
    }
  }

  const fileInput = (
    <input
      type="file"
      accept="image/*"
      className="sr-only"
      disabled={busy}
      onChange={(e) => {
        const file = e.target.files?.[0] ?? null;
        // Se deja libre para poder elegir la misma foto otra vez.
        e.target.value = "";
        pick(file);
      }}
    />
  );
  const photoButtonClass =
    "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/10 focus-within:bg-accent/10";

  return (
    <section
      aria-label={t("title")}
      className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <Avatar name={me.name} src={me.avatarUrl} />
        {open ? (
          <span className="font-display font-medium text-lg text-foreground">
            {t("title")}
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setOpen(true);
              }}
              className="min-w-0 flex-1 truncate rounded-full bg-black/[0.05] px-4 py-2.5 text-left text-sm text-muted hover:bg-black/[0.08]"
            >
              {/* En celular no cabe el nombre. */}
              <span className="sm:hidden">{t("promptShort")}</span>
              <span className="hidden sm:inline">
                {t("prompt", { name: me.name.split(" ")[0] })}
              </span>
            </button>
            <label className={photoButtonClass}>
              <IconCamera className="w-5 h-5" />
              <span className="hidden sm:inline">{t("photo")}</span>
              <span className="sr-only sm:hidden">{t("photo")}</span>
              {fileInput}
            </label>
          </>
        )}
      </div>

      {done && !open && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          {t(done)}
        </p>
      )}

      {open && (
        <form onSubmit={publish} className="mt-3 flex flex-col gap-3">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={3}
            required={!photo}
            aria-label={t("label")}
            placeholder={t("prompt", { name: me.name.split(" ")[0] })}
            className={`${inputClass} resize-none`}
          />

          {photo && (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt={messages("preview")}
                className="max-h-64 rounded-xl border border-border"
              />
              <button
                type="button"
                onClick={removePhoto}
                disabled={busy}
                aria-label={messages("removePhoto")}
                className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-xs text-muted hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className={photoButtonClass}>
              <IconCamera className="w-5 h-5" />
              {photo ? t("changePhoto") : t("photo")}
              {fileInput}
            </label>
            <select
              value={isPublic ? "public" : "private"}
              onChange={(e) => setIsPublic(e.target.value === "public")}
              aria-label={t("visibility")}
              className="min-w-0 cursor-pointer rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground"
            >
              <option value="public">{t("everyone")}</option>
              <option value="private">{t("onlyMe")}</option>
            </select>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="text-sm text-muted hover:underline disabled:opacity-50"
            >
              {common("cancel")}
            </button>
            <button
              type="submit"
              disabled={busy || (!text.trim() && !photo)}
              className={primaryButtonClass}
            >
              {busy ? t("publishing") : t("publish")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
