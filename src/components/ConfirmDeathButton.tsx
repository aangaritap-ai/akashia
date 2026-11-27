"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ConfirmDeathButton({ token }: { token: string }) {
  const [state, setState] = useState<
    "idle" | "confirming" | "loading" | "done" | "error"
  >("idle");
  const [pending, setPending] = useState(false);
  const [graceHours, setGraceHours] = useState(48);
  const t = useTranslations("death");
  const common = useTranslations("common");

  async function confirm() {
    setState("loading");
    const res = await fetch("/api/guardians/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      setState("error");
      return;
    }
    const data = await res.json();
    setPending(Boolean(data.pending));
    if (data.graceHours) setGraceHours(data.graceHours);
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
        {t("thanks")}{" "}
        {pending
          ? t("graceStarted", { hours: graceHours })
          : t("waitingOther")}
      </div>
    );
  }

  if (state === "confirming" || state === "loading") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-sm text-red-800">
          {t("warning")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={confirm}
            disabled={state === "loading"}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {state === "loading" ? t("confirming") : t("sure")}
          </button>
          <button
            onClick={() => setState("idle")}
            disabled={state === "loading"}
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted hover:bg-black/[0.03]"
          >
            {common("cancel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state === "error" && (
        <div className="text-sm text-red-600">
          {t("failed")}
        </div>
      )}
      <button
        onClick={() => setState("confirming")}
        className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background hover:brightness-110"
      >
        {t("confirm")}
      </button>
    </div>
  );
}
