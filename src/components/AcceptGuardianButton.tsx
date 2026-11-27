"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function AcceptGuardianButton({ token }: { token: string }) {
  const router = useRouter();
  const t = useTranslations("guardians");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/guardians/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t("acceptFailed"));
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button
        onClick={accept}
        disabled={loading}
        className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        {loading ? t("accepting") : t("accept")}
      </button>
    </div>
  );
}
