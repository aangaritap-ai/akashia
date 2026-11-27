"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { shrinkImage } from "@/lib/shrink-image";
import { MAX_UPLOAD_BYTES } from "@/lib/uploads";

export default function MemorialMessageForm({
  userId,
  canAttachPhoto,
  ownerName,
  isOwner,
  petId,
}: {
  userId: string;
  petId?: string;
  canAttachPhoto: boolean;
  ownerName: string;
  isOwner: boolean;
}) {
  const firstName = ownerName.split(" ")[0];
  const router = useRouter();
  const t = useTranslations("messages");
  const common = useTranslations("common");
  const uploads = useTranslations("uploads");
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<"public" | "private" | null>(null);

  function onFileChange(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl: string | null = null;

      if (file) {
        const photo = await shrinkImage(file);
        if (photo.size > MAX_UPLOAD_BYTES) throw new Error(uploads("tooBig"));
        const form = new FormData();
        form.append("file", photo);
        const uploadRes = await fetch("/api/memorial/upload", {
          method: "POST",
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || t("uploadFailed"));
        }
        imageUrl = uploadData.url;
      }

      const res = await fetch(`/api/memorial/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          message,
          imageUrl,
          isPublic,
          petId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("sendFailed"));
      }

      setAuthorName("");
      setMessage("");
      onFileChange(null);
      setSent(isPublic ? "public" : "private");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3 shadow-sm"
    >
      <div className="text-sm font-semibold text-foreground">
        {t("formTitle")}
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {sent && (
        <div role="status" className="text-sm text-emerald-700">
          {sent === "private" && !isOwner
            ? t("thanksPrivate", { name: firstName })
            : t("thanks")}
        </div>
      )}
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder={t("yourName")}
        required
        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t("placeholder")}
        required
        rows={4}
        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent resize-none"
      />

      {!canAttachPhoto && (
        <p className="text-xs text-muted">
          {t("wantPhoto")}{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(
              petId ? `/huellitas/${petId}` : `/memorial/${userId}`
            )}`}
            className="font-semibold text-accent hover:underline"
          >
            {t("logInLink")}
          </Link>
          .
        </p>
      )}

      <div className={canAttachPhoto ? "flex flex-col gap-2" : "hidden"}>
        <label className="text-xs text-muted">{t("photoOptional")}</label>
        {preview && (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={t("preview")}
              className="max-h-40 rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="absolute -top-2 -right-2 bg-background border border-border rounded-full w-6 h-6 text-xs text-muted hover:text-red-600"
              aria-label={t("removePhoto")}
            >
              ✕
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          className="text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPublic(true)}
          className={`rounded-lg px-3 py-1.5 text-xs border ${
            isPublic
              ? "border-accent bg-accent/15 text-accent"
              : "border-border text-muted"
          }`}
        >
          {t("publicOption")}
        </button>
        <button
          type="button"
          onClick={() => setIsPublic(false)}
          className={`rounded-lg px-3 py-1.5 text-xs border ${
            !isPublic
              ? "border-accent bg-accent/15 text-accent"
              : "border-border text-muted"
          }`}
        >
          {isOwner
            ? t("privateOwner")
            : t("privateOther", { name: firstName })}
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        {loading ? common("sending") : t("submit")}
      </button>
    </form>
  );
}
