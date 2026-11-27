"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import AuthShell from "@/components/AuthShell";
import {
  Callout,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui";

export default function ResetPasswordPage({
  params,
}: PageProps<"/[locale]/reset-password/[token]">) {
  const { token } = use(params);
  const router = useRouter();
  const t = useTranslations("auth");
  const common = useTranslations("common");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t("resetFailed"));
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <AuthShell
      title={t("resetTitle")}
      subtitle={t("resetSubtitle")}
    >
      {done ? (
        <Callout tone="success" className="text-center">
          {t("resetDone")}
        </Callout>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error && (
            <Callout tone="danger" className="!py-3">
              {error}
            </Callout>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className={labelClass}>
              {t("newPassword")}
            </label>
            <input
              id="password"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
            <p className="text-xs text-muted">{common("minPassword")}</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`mt-1 ${primaryButtonClass}`}
          >
            {loading ? common("saving") : t("changePassword")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
