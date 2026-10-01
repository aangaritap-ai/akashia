"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CancelDeathButton({ token }: { token?: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setState("loading");
    setError(null);
    const res = await fetch("/api/account/cancel-death", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(token ? { token } : {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "No se pudo cancelar");
      setState("error");
      return;
    }
    setState("done");
    router.refresh();
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
        Listo, se canceló. Tus guardianes fueron avisados de que sigues con
        nosotros.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state === "error" && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      <button
        onClick={cancel}
        disabled={state === "loading"}
        className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        {state === "loading" ? "Cancelando..." : "Cancelar — estoy bien"}
      </button>
    </div>
  );
}
