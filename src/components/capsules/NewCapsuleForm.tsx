"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import CapsuleRecorder from "@/components/camera/CapsuleRecorder";
import RecipientsField from "@/components/capsules/RecipientsField";
import WhenField, { type TriggerType } from "@/components/capsules/WhenField";
import {
  emptyRow,
  toPayload,
  type Follower,
  type RecipientRow,
} from "@/lib/recipients";
import { uploadCapsuleMedia } from "@/lib/upload-media";

type CapsuleType = "TEXT" | "AUDIO" | "VIDEO";

export default function NewCapsuleForm({
  followers,
  guardianCount,
  minDate,
}: {
  followers: Follower[];
  guardianCount: number;
  minDate: string;
}) {
  const router = useRouter();
  const pageLocale = useLocale();
  const [mailLocale, setMailLocale] = useState(pageLocale);
  const t = useTranslations("capsules");
  const common = useTranslations("common");
  const profile = useTranslations("profile");
  const messages = useTranslations("messages");

  const [title, setTitle] = useState("");
  const [type, setType] = useState<CapsuleType>("TEXT");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  // Al grabar, el selector de archivo vuelve a quedar vacío.
  const [recordings, setRecordings] = useState(0);
  const [recipients, setRecipients] = useState<RecipientRow[]>([
    emptyRow("primera"),
  ]);
  const [triggerType, setTriggerType] = useState<TriggerType>("DATE");
  const [triggerDate, setTriggerDate] = useState("");

  const [loading, setLoading] = useState(false);
  // Avance de la subida del audio o video.
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let mediaUrl: string | null = null;

      if ((type === "AUDIO" || type === "VIDEO") && file) {
        mediaUrl = await uploadCapsuleMedia(file, t, setProgress);
      }

      const res = await fetch("/api/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          textContent: type === "TEXT" ? textContent : null,
          mediaUrl,
          recipients: recipients.map(toPayload),
          locale: mailLocale,
          triggerType,
          triggerDate: triggerType === "DATE" ? triggerDate : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || profile("saveFailed"));

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : messages("somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <h1 className="font-display text-2xl text-foreground">{t("newTitle")}</h1>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted">{t("messageTitle")}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder={t("titlePlaceholder")}
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-muted">{t("messageType")}</label>
          <div className="flex gap-2">
            {(["TEXT", "AUDIO", "VIDEO"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  if (kind !== type) setFile(null);
                  setType(kind);
                }}
                className={`rounded-lg px-4 py-2 text-sm border ${
                  type === kind
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted"
                }`}
              >
                {t(`type${kind}`)}
              </button>
            ))}
          </div>
        </div>

        {type === "TEXT" ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">{t("yourMessage")}</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              required
              rows={6}
              className="rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent resize-none"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">
              {type === "AUDIO" ? t("audioFile") : t("videoFile")}
            </label>
            {type === "VIDEO" && (
              <CapsuleRecorder
                file={file}
                onRecorded={(video) => {
                  setFile(video);
                  setRecordings((n) => n + 1);
                }}
              />
            )}
            <input
              key={`${type}-${recordings}`}
              type="file"
              accept={type === "AUDIO" ? "audio/*" : "video/*"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required={!file}
              className="text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-background"
            />
          </div>
        )}

        <RecipientsField
          rows={recipients}
          onChange={setRecipients}
          followers={followers}
          mailLocale={mailLocale}
          onMailLocale={setMailLocale}
        />

        <WhenField
          type={triggerType}
          onType={setTriggerType}
          date={triggerDate}
          onDate={setTriggerDate}
          minDate={minDate}
          guardianCount={guardianCount}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
        >
          {!loading
            ? t("save")
            : progress > 0 && progress < 100
              ? t("uploadingFile", { percent: progress })
              : common("saving")}
        </button>
      </form>
    </div>
  );
}
