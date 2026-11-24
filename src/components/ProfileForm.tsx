"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconCamera } from "@/components/icons";
import Avatar from "@/components/Avatar";
import {
  Callout,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui";

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

  return (
    <form
      onSubmit={onSubmit}
      className="reveal rounded-2xl border border-border bg-surface overflow-hidden shadow-sm"
    >
      <div className="relative h-24 sm:h-28 bg-accent overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-16 right-10 w-56 h-56 rounded-full bg-gold/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #faf6ef 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      <div className="px-5 sm:px-7 pb-7 flex flex-col gap-6">
        <div className="flex items-end gap-4 -mt-10">
          <div className="relative shrink-0">
            <Avatar
              name={name || "?"}
              src={avatarUrl}
              size="xl"
              className="relative ring-4 ring-surface shadow-sm"
            />
            <label
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-background ring-2 ring-surface flex items-center justify-center cursor-pointer hover:brightness-110"
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
          <div className="pb-1 text-sm text-muted">
            {uploading
              ? "Subiendo foto..."
              : "Toca la cámara para cambiar tu foto."}
          </div>
        </div>

        {error && (
          <Callout tone="danger" className="!py-3">
            {error}
          </Callout>
        )}
        {saved && (
          <Callout tone="success" className="!py-3">
            Perfil actualizado.
          </Callout>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-name" className={labelClass}>
            Nombre
          </label>
          <input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-email" className={labelClass}>
            Correo
          </label>
          <input
            id="profile-email"
            value={email}
            disabled
            className={inputClass}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className={primaryButtonClass}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <div className="text-xs text-muted">
            Miembro desde {new Date(memberSince).toLocaleDateString("es")}
          </div>
        </div>
      </div>
    </form>
  );
}
