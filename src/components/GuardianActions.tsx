"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GuardianActions({
  id,
  canResend,
}: {
  id: string;
  canResend: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"delete" | "resend" | null>(null);
  const [resent, setResent] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    setBusy("delete");
    await fetch(`/api/guardians/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  async function resend() {
    setBusy("resend");
    await fetch(`/api/guardians/${id}/resend`, { method: "POST" });
    setBusy(null);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted">¿Eliminar?</span>
        <button
          onClick={remove}
          disabled={busy !== null}
          className="text-red-600 font-semibold hover:underline disabled:opacity-50"
        >
          {busy === "delete" ? "Eliminando..." : "Sí, eliminar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-muted hover:underline"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {canResend && (
        <button
          onClick={resend}
          disabled={busy !== null}
          className="text-accent font-semibold hover:underline disabled:opacity-50"
        >
          {resent ? "Enviado" : busy === "resend" ? "Enviando..." : "Reenviar"}
        </button>
      )}
      <button
        onClick={() => setConfirming(true)}
        disabled={busy !== null}
        className="text-muted hover:text-red-600 disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
