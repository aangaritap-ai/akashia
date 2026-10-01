"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconCamera } from "@/components/icons";

export default function ProfileForm({
  name: initialName,
  email,
  avatarUrl: initialAvatarUrl,
  memberSince,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  memberSince: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onPhotoChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir la foto");
      setAvatarUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatarUrl }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo guardar");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-surface p-6 flex flex-col gap-6 shadow-sm"
    >
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {saved && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          Perfil actualizado.
        </div>
      )}

      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-accent/15 text-accent flex items-center justify-center font-display text-2xl border border-border">
              {initial}
            </div>
          )}
          <label
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-background flex items-center justify-center cursor-pointer hover:brightness-110"
            aria-label="Cambiar foto"
          >
            <IconCamera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="text-sm text-muted">
          {uploading ? "Subiendo foto..." : "Haz clic en la cámara para cambiar tu foto."}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted">Correo</label>
        <input
          value={email}
          disabled
          className="rounded-lg border border-border bg-black/[0.03] px-4 py-2.5 text-sm text-muted"
        />
      </div>

      <div className="text-xs text-muted">
        Miembro desde {new Date(memberSince).toLocaleDateString("es")}
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="self-start rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
