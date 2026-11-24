"use client";

import { useState } from "react";
import { StatusPill, primaryButtonClass } from "@/components/ui";
import { useApiAction } from "@/components/useApiAction";
import type { FollowState } from "@/lib/connections";

const link = "text-xs text-muted hover:underline disabled:opacity-50";

// Mi relación hacia otra persona: Seguir → Solicitud enviada → Siguiendo.
export default function FollowButton({
  userId,
  initialState,
  initialConnectionId,
}: {
  userId: string;
  initialState: FollowState;
  initialConnectionId: string | null;
}) {
  const [state, setState] = useState(initialState);
  const [connectionId, setConnectionId] = useState(initialConnectionId);
  const [confirming, setConfirming] = useState(false);
  const { busy, error, run } = useApiAction();

  const follow = () =>
    run<{ connection?: { id: string } }>(
      () =>
        fetch("/api/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
      (data) => {
        setConnectionId(data.connection?.id ?? null);
        setState("sent");
      }
    );

  const stop = () =>
    run(
      () => fetch(`/api/connections/${connectionId}`, { method: "DELETE" }),
      () => {
        setConnectionId(null);
        setConfirming(false);
        setState("none");
      }
    );

  let body: React.ReactNode;

  if (state === "none") {
    body = (
      <button
        onClick={follow}
        disabled={busy}
        className={`${primaryButtonClass} !py-2 whitespace-nowrap`}
      >
        {busy ? "Enviando..." : "Seguir"}
      </button>
    );
  } else if (state === "sent") {
    body = (
      <div className="flex items-center gap-3">
        <StatusPill tone="gold">Solicitud enviada</StatusPill>
        <button onClick={stop} disabled={busy} className={link}>
          Cancelar
        </button>
      </div>
    );
  } else if (confirming) {
    body = (
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted">¿Dejar de seguir?</span>
        <button
          onClick={stop}
          disabled={busy}
          className="text-red-600 font-semibold hover:underline disabled:opacity-50"
        >
          {busy ? "..." : "Sí"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-muted hover:underline"
        >
          No
        </button>
      </div>
    );
  } else {
    body = (
      <div className="flex items-center gap-3">
        <StatusPill tone="success">Siguiendo</StatusPill>
        <button onClick={() => setConfirming(true)} className={link}>
          Dejar de seguir
        </button>
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
