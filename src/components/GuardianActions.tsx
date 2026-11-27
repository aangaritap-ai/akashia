"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function GuardianActions({
  id,
  canResend,
}: {
  id: string;
  canResend: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("guardians");
  const common = useTranslations("common");
  const [busy, setBusy] = useState<"delete" | "resend" | null>(null);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    setBusy("delete");
    await fetch(`/api/guardians/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  async function resend() {
    setBusy("resend");
    setResendError(null);
    const res = await fetch(`/api/guardians/${id}/resend`, { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setResendError(data.error || t("sendFailed"));
      return;
    }
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted">{t("confirmRemove")}</span>
        <button
          onClick={remove}
          disabled={busy !== null}
          className="text-red-600 font-semibold hover:underline disabled:opacity-50"
        >
          {busy === "delete" ? t("removing") : t("yesRemove")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-muted hover:underline"
        >
          {common("cancel")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3 text-xs">
        {canResend && (
          <button
            onClick={resend}
            disabled={busy !== null}
            className="text-accent font-semibold hover:underline disabled:opacity-50"
          >
            {resent
              ? t("sent")
              : busy === "resend"
                ? common("sending")
                : t("resend")}
          </button>
        )}
        <button
          onClick={() => setConfirming(true)}
          disabled={busy !== null}
          className="text-muted hover:text-red-600 disabled:opacity-50"
        >
          {t("removeButton")}
        </button>
      </div>
      {resendError && (
        <div className="text-xs text-red-600 max-w-[220px] text-right">
          {resendError}
        </div>
      )}
    </div>
  );
}
