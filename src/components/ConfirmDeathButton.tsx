"use client";

import { useState } from "react";

export default function ConfirmDeathButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [triggered, setTriggered] = useState(false);

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
    setTriggered(Boolean(data.triggered));
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
        Gracias por confirmarlo.{" "}
        {triggered
          ? "Con esto se activó la entrega de los mensajes."
          : "Se está esperando la confirmación de otro guardián antes de entregar los mensajes."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state === "error" && (
        <div className="text-sm text-red-300">
          Ocurrió un error. Intenta de nuevo.
        </div>
      )}
      <button
        onClick={confirm}
        disabled={state === "loading"}
        className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-[#221806] hover:brightness-110 disabled:opacity-60"
      >
        {state === "loading" ? "Confirmando..." : "Sí, confirmo el fallecimiento"}
      </button>
    </div>
  );
}
