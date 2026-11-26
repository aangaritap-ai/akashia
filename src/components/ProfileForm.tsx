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
import { MAX_BIO, MAX_CITY, MAX_MOTTO } from "@/lib/profile";
import { shrinkImage } from "@/lib/shrink-image";
import { MONTH_NAMES } from "@/lib/special-dates";
import { MAX_UPLOAD_BYTES, TOO_BIG_MESSAGE } from "@/lib/uploads";

export type ProfileValues = {
  name: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string;
  motto: string;
  city: string;
  showCity: boolean;
  birthMonth: string;
  birthDay: string;
  shareBirthday: boolean;
};

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-2.5 text-sm text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
      />
      <span>{children}</span>
    </label>
  );
}

export default function ProfileForm({
  initial,
  email,
  memberSince,
}: {
  initial: ProfileValues;
  email: string;
  memberSince: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onImage(kind: "avatar" | "cover", file: File | null) {
    if (!file) return;
    setUploading(kind);
    setError(null);
    try {
      const photo = await shrinkImage(file, kind === "avatar" ? 800 : 1600);
      if (photo.size > MAX_UPLOAD_BYTES) throw new Error(TOO_BIG_MESSAGE);
      const form = new FormData();
      form.append("file", photo);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo subir la foto");
      set(kind === "avatar" ? "avatarUrl" : "coverUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setUploading(null);
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
      body: JSON.stringify({
        ...values,
        birthMonth: values.birthMonth ? Number(values.birthMonth) : null,
        birthDay: values.birthDay ? Number(values.birthDay) : null,
      }),
    }).catch(() => null);

    setSaving(false);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error || "No se pudo guardar");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  // El campo de archivo se deja libre para poder elegir la misma foto otra vez.
  const pick =
    (kind: "avatar" | "cover") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      e.target.value = "";
      onImage(kind, file);
    };

  return (
    <form
      onSubmit={onSubmit}
      className="reveal rounded-2xl border border-border bg-surface overflow-hidden shadow-sm"
    >
      <div className="relative h-32 sm:h-40 bg-accent overflow-hidden">
        {values.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.coverUrl}
            alt="Tu portada"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute -top-16 right-10 w-56 h-56 rounded-full bg-gold/30 blur-3xl"
          />
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/70">
            <IconCamera className="w-4 h-4" />
            {uploading === "cover"
              ? "Subiendo..."
              : values.coverUrl
                ? "Cambiar portada"
                : "Agregar portada"}
            <input
              type="file"
              accept="image/*"
              aria-label="Foto de portada"
              className="hidden"
              disabled={uploading !== null}
              onChange={pick("cover")}
            />
          </label>
          {values.coverUrl && (
            <button
              type="button"
              onClick={() => set("coverUrl", null)}
              className="rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/70"
            >
              Quitar
            </button>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-7 pb-7 flex flex-col gap-6">
        <div className="flex items-end gap-4 -mt-10">
          <div className="relative shrink-0">
            <Avatar
              name={values.name || "?"}
              src={values.avatarUrl}
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
                disabled={uploading !== null}
                onChange={pick("avatar")}
              />
            </label>
          </div>
          <div className="pb-1 text-sm text-muted">
            {uploading === "avatar"
              ? "Subiendo foto..."
              : "Toca la cámara para cambiar tu foto."}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-name" className={labelClass}>
            Nombre
          </label>
          <input
            id="profile-name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-motto" className={labelClass}>
            Mi frase: cómo quiero que me recuerden
          </label>
          <input
            id="profile-motto"
            value={values.motto}
            onChange={(e) => set("motto", e.target.value)}
            maxLength={MAX_MOTTO}
            placeholder="Con una sonrisa y la mesa llena"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-bio" className={labelClass}>
            Sobre mí
          </label>
          <textarea
            id="profile-bio"
            value={values.bio}
            onChange={(e) => set("bio", e.target.value)}
            maxLength={MAX_BIO}
            rows={4}
            placeholder="Quién eres, qué te apasiona, a quiénes amas..."
            className={`${inputClass} resize-none`}
          />
          <div className="text-right text-xs text-muted">
            {values.bio.length}/{MAX_BIO}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-city" className={labelClass}>
            Ciudad
          </label>
          <input
            id="profile-city"
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            maxLength={MAX_CITY}
            placeholder="Barichara"
            className={inputClass}
          />
          <Check
            checked={values.showCity}
            onChange={(v) => set("showCity", v)}
          >
            Mostrar mi ciudad en mi página
          </Check>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${labelClass} mb-2`}>Cumpleaños</legend>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
            <select
              value={values.birthDay}
              onChange={(e) => set("birthDay", e.target.value)}
              aria-label="Día de cumpleaños"
              className={inputClass}
            >
              <option value="">Día</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select
              value={values.birthMonth}
              onChange={(e) => set("birthMonth", e.target.value)}
              aria-label="Mes de cumpleaños"
              className={inputClass}
            >
              <option value="">Mes</option>
              {MONTH_NAMES.map((month, i) => (
                <option key={month} value={i + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <Check
            checked={values.shareBirthday}
            onChange={(v) => set("shareBirthday", v)}
          >
            Mis seguidores pueden verlo y recibir un aviso ese día
          </Check>
          <p className="text-xs text-muted">No pedimos el año.</p>
        </fieldset>

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

        <div className="flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={saving || uploading !== null}
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
