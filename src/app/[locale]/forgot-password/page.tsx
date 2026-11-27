"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import AuthShell from "@/components/AuthShell";
import {
  Callout,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setLoading(false);
    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error || t("sendFailed"));
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      title={t("forgotTitle")}
      subtitle={t("forgotSubtitle")}
      footer={
        <p>
          <Link
            href="/login"
            className="text-accent font-semibold hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </p>
      }
    >
      {sent ? (
        <Callout tone="success" className="text-center">
          {t("forgotSent")}
        </Callout>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error && (
            <Callout tone="danger" className="!py-3">
              {error}
            </Callout>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClass}>
              {common("email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`mt-1 ${primaryButtonClass}`}
          >
            {loading ? common("sending") : t("sendLink")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
