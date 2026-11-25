"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { shrinkImage } from "@/lib/shrink-image";
import { MAX_UPLOAD_BYTES, TOO_BIG_MESSAGE } from "@/lib/uploads";

export default function MemorialMessageForm({
  userId,
  canAttachPhoto,
  ownerName,
  isOwner,
}: {
  userId: string;
  canAttachPhoto: boolean;
  ownerName: string;
  isOwner: boolean;
}) {
  const firstName = ownerName.split(" ")[0];
  const router = useRouter();
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
        if (photo.size > MAX_UPLOAD_BYTES) throw new Error(TOO_BIG_MESSAGE);
        const form = new FormData();
        form.append("file", photo);
        const uploadRes = await fetch("/api/memorial/upload", {
          method: "POST",
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "No se pudo subir la foto");
        }
        imageUrl = uploadData.url;
      }

      const res = await fetch(`/api/memorial/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, message, imageUrl, isPublic }),
      });

      if (!res.ok) {
        throw new Error("No se pudo enviar el mensaje. Intenta de nuevo.");
      }

      setAuthorName("");
      setMessage("");
      onFileChange(null);
      setSent(isPublic ? "public" : "private");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
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
        Deja un mensaje o un recuerdo
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {sent && (
        <div role="status" className="text-sm text-emerald-700">
          {sent === "private" && !isOwner
            ? `Gracias. Tu mensaje privado solo lo verá ${firstName}.`
            : "Gracias por dejar tu mensaje."}
        </div>
      )}
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Tu nombre"
        required
        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Comparte un recuerdo, una foto en palabras, o simplemente gracias"
        required
        rows={4}
        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent resize-none"
      />

      {!canAttachPhoto && (
        <p className="text-xs text-muted">
          ¿Quieres adjuntar una foto?{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/memorial/${userId}`)}`}
            className="font-semibold text-accent hover:underline"
          >
            Inicia sesión
          </Link>
          .
        </p>
      )}

      <div className={canAttachPhoto ? "flex flex-col gap-2" : "hidden"}>
        <label className="text-xs text-muted">Foto (opcional)</label>
        {preview && (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Vista previa"
              className="max-h-40 rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="absolute -top-2 -right-2 bg-background border border-border rounded-full w-6 h-6 text-xs text-muted hover:text-red-600"
              aria-label="Quitar foto"
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
          Público — aparece en el feed
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
          {isOwner ? "Privado — solo tú" : `Privado — solo ${firstName}`}
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Dejar mensaje"}
      </button>
    </form>
  );
}
