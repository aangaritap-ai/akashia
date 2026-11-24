"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusPill } from "@/components/ui";
import type { RelationState } from "@/lib/connections";

const primary =
  "rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:brightness-110 disabled:opacity-60 whitespace-nowrap";
const link = "text-xs text-muted hover:underline disabled:opacity-50";

// Botón que se adapta a la relación entre dos personas: conectar, solicitud
// enviada (cancelar), solicitud recibida (aceptar o rechazar) o conectados.
export default function ConnectButton({
  userId,
  initialState,
  initialConnectionId,
  allowRemove = false,
}: {
  userId: string;
  initialState: RelationState;
  initialConnectionId: string | null;
  allowRemove?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [connectionId, setConnectionId] = useState(initialConnectionId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function run(
    request: () => Promise<Response>,
    onOk: (data: { connection?: { id: string }; accepted?: boolean }) => void
  ) {
    setBusy(true);
    setError(null);
    try {
      const res = await request();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo completar la acción");
        return;
      }
      onOk(data);
      router.refresh();
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const connect = () =>
    run(
      () =>
        fetch("/api/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
      (data) => {
        setConnectionId(data.connection?.id ?? null);
        setState(data.accepted ? "connected" : "sent");
      }
    );

  const remove = (next: RelationState) =>
    run(
      () => fetch(`/api/connections/${connectionId}`, { method: "DELETE" }),
      () => {
        setConnectionId(null);
        setConfirming(false);
        setState(next);
      }
    );

  const respond = (action: "accept" | "decline") =>
    run(
      () =>
        fetch(`/api/connections/${connectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }),
      () => {
        if (action === "accept") {
          setState("connected");
        } else {
          setConnectionId(null);
          setState("none");
        }
      }
    );

  let body: React.ReactNode;

  if (state === "none") {
    body = (
      <button onClick={connect} disabled={busy} className={primary}>
        {busy ? "Enviando..." : "Conectar"}
      </button>
    );
  } else if (state === "sent") {
    body = (
      <div className="flex items-center gap-3">
        <StatusPill tone="gold">Solicitud enviada</StatusPill>
        <button
          onClick={() => remove("none")}
          disabled={busy}
          className={link}
        >
          Cancelar
        </button>
      </div>
    );
  } else if (state === "received") {
    body = (
      <div className="flex items-center gap-3">
        <button
          onClick={() => respond("accept")}
          disabled={busy}
          className={primary}
        >
          {busy ? "..." : "Aceptar"}
        </button>
        <button
          onClick={() => respond("decline")}
          disabled={busy}
          className={link}
        >
          Ahora no
        </button>
      </div>
    );
  } else if (allowRemove && confirming) {
    body = (
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted">¿Quitar conexión?</span>
        <button
          onClick={() => remove("none")}
          disabled={busy}
          className="text-red-600 font-semibold hover:underline disabled:opacity-50"
        >
          {busy ? "Quitando..." : "Sí, quitar"}
        </button>
        <button onClick={() => setConfirming(false)} className="text-muted hover:underline">
          Cancelar
        </button>
      </div>
    );
  } else {
    body = (
      <div className="flex items-center gap-3">
        <StatusPill tone="success">Conectados</StatusPill>
        {allowRemove && (
          <button
            onClick={() => setConfirming(true)}
            disabled={busy}
            className={link}
          >
            Quitar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {body}
      {error && (
        <div className="text-xs text-red-600 max-w-[220px] text-right">
          {error}
        </div>
      )}
    </div>
  );
}
