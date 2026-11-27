"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
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
import { monthName } from "@/lib/special-dates";
import { MAX_UPLOAD_BYTES } from "@/lib/uploads";

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
  const t = useTranslations("profile");
  const common = useTranslations("common");
  const messages = useTranslations("messages");
  const uploads = useTranslations("uploads");
  const locale = useLocale();
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
      if (photo.size > MAX_UPLOAD_BYTES) throw new Error(uploads("tooBig"));
      const form = new FormData();
      form.append("file", photo);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || messages("uploadFailed"));
      set(kind === "avatar" ? "avatarUrl" : "coverUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : messages("somethingWrong"));
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
      setError(data?.error || t("saveFailed"));
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
            alt={t("coverAlt")}
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
              ? t("uploading")
              : values.coverUrl
                ? t("changeCover")
                : t("addCover")}
            <input
              type="file"
              accept="image/*"
              aria-label={t("coverLabel")}
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
              {common("remove")}
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
              aria-label={t("changePhoto")}
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
              ? t("uploadingPhoto")
              : t("tapCamera")}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-name" className={labelClass}>
            {common("name")}
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
            {t("motto")}
          </label>
          <input
            id="profile-motto"
            value={values.motto}
            onChange={(e) => set("motto", e.target.value)}
            maxLength={MAX_MOTTO}
            placeholder={t("mottoPlaceholder")}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-bio" className={labelClass}>
            {t("bio")}
          </label>
          <textarea
            id="profile-bio"
            value={values.bio}
            onChange={(e) => set("bio", e.target.value)}
            maxLength={MAX_BIO}
            rows={4}
            placeholder={t("bioPlaceholder")}
            className={`${inputClass} resize-none`}
          />
          <div className="text-right text-xs text-muted">
            {values.bio.length}/{MAX_BIO}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-city" className={labelClass}>
            {t("city")}
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
            {t("showCity")}
          </Check>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${labelClass} mb-2`}>{t("birthday")}</legend>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
            <select
              value={values.birthDay}
              onChange={(e) => set("birthDay", e.target.value)}
              aria-label={t("birthDayLabel")}
              className={inputClass}
            >
              <option value="">{t("day")}</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select
              value={values.birthMonth}
              onChange={(e) => set("birthMonth", e.target.value)}
              aria-label={t("birthMonthLabel")}
              className={inputClass}
            >
              <option value="">{t("month")}</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {monthName(i + 1, locale)}
                </option>
              ))}
            </select>
          </div>
          <Check
            checked={values.shareBirthday}
            onChange={(v) => set("shareBirthday", v)}
          >
            {t("shareBirthday")}
          </Check>
          <p className="text-xs text-muted">{t("noYear")}</p>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-email" className={labelClass}>
            {common("email")}
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
            {t("updated")}
          </Callout>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={saving || uploading !== null}
            className={primaryButtonClass}
          >
            {saving ? common("saving") : t("saveChanges")}
          </button>
          <div className="text-xs text-muted">
            {t("memberSince", {
              date: new Date(memberSince).toLocaleDateString(locale),
            })}
          </div>
        </div>
      </div>
    </form>
  );
}
