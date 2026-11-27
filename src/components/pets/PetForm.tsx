"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Avatar from "@/components/Avatar";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import {
  MAX_PET_NAME,
  MAX_PET_STORY,
  PET_SPECIES,
  type Species,
} from "@/lib/pets";
import { shrinkImage } from "@/lib/shrink-image";
import { MAX_UPLOAD_BYTES } from "@/lib/uploads";

export type PetValues = {
  name: string;
  species: Species;
  story: string;
  photoUrl: string | null;
  birthDate: string;
  adoptionDate: string;
  passedDate: string;
};

const EMPTY: PetValues = {
  name: "",
  species: "DOG",
  story: "",
  photoUrl: null,
  birthDate: "",
  adoptionDate: "",
  passedDate: "",
};

const DATE_FIELDS = ["birthDate", "adoptionDate", "passedDate"] as const;

// Sirve para agregar (sin petId) y para editar una mascota.
export default function PetForm({
  petId,
  initial = EMPTY,
}: {
  petId?: string;
  initial?: PetValues;
}) {
  const router = useRouter();
  const t = useTranslations("petsPage");
  const common = useTranslations("common");
  const profile = useTranslations("profile");
  const messages = useTranslations("messages");
  const uploads = useTranslations("uploads");
  const species = useTranslations("pets");
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState<"photo" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof PetValues>(key: K, value: PetValues[K]) {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onPhoto(file: File | null) {
    if (!file) return;
    setBusy("photo");
    setError(null);
    try {
      const photo = await shrinkImage(file, 1200);
      if (photo.size > MAX_UPLOAD_BYTES) throw new Error(uploads("tooBig"));
      const form = new FormData();
      form.append("file", photo);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || messages("uploadFailed"));
      set("photoUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : messages("somethingWrong"));
    } finally {
      setBusy(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    setError(null);
    try {
      const res = await fetch(petId ? `/api/pets/${petId}` : "/api/pets", {
        method: petId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          story: values.story || null,
          birthDate: values.birthDate || null,
          adoptionDate: values.adoptionDate || null,
          passedDate: values.passedDate || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || profile("saveFailed"));
      if (!petId) setValues(EMPTY);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : messages("somethingWrong"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="reveal rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4 shadow-sm"
    >
      <h2 className="font-display font-medium text-xl text-foreground">
        {petId ? t("formEdit") : t("formAdd")}
      </h2>

      <div className="flex items-center gap-4">
        <Avatar
          name={values.name || "?"}
          src={values.photoUrl}
          size="xl"
        />
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
          <span className={labelClass}>
            {busy === "photo" ? t("uploadingPhoto") : t("photo")}
          </span>
          <input
            type="file"
            accept="image/*"
            disabled={busy !== null}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              // La vista previa es el avatar: el campo se deja libre.
              e.target.value = "";
              onPhoto(file);
            }}
            className="w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{common("name")}</span>
          <input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={MAX_PET_NAME}
            required
            placeholder="Luna"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t("species")}</span>
          <select
            value={values.species}
            onChange={(e) => set("species", e.target.value as Species)}
            className={inputClass}
          >
            {PET_SPECIES.map((s) => (
              <option key={s} value={s}>
                {species(`species${s}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {DATE_FIELDS.map((key) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className={labelClass}>{t(key)}</span>
            <input
              type="date"
              min="1900-01-01"
              value={values[key]}
              onChange={(e) => set(key, e.target.value)}
              className={inputClass}
            />
          </label>
        ))}
      </div>
      <p className="-mt-2 text-xs text-muted">
        {t("datesHint")}
      </p>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>{t("story")}</span>
        <textarea
          value={values.story}
          onChange={(e) => set("story", e.target.value)}
          maxLength={MAX_PET_STORY}
          rows={4}
          placeholder={t("storyPlaceholder")}
          className={`${inputClass} resize-none`}
        />
      </label>

      {error && (
        <div
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
        >
          {error}
        </div>
      )}
      {saved && (
        <div role="status" className="text-sm text-emerald-700">
          {petId ? t("saved") : t("added")}
        </div>
      )}

      <button
        type="submit"
        disabled={busy !== null}
        className={`${primaryButtonClass} self-start`}
      >
        {busy === "save"
          ? common("saving")
          : petId
            ? profile("saveChanges")
            : t("add")}
      </button>
    </form>
  );
}
