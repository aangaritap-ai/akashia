"use client";

import { useState } from "react";
import { primaryButtonClass } from "@/components/ui";
import { useApiAction } from "@/components/useApiAction";

const link = "text-xs text-muted hover:underline disabled:opacity-50";

// Lo que hago con alguien que pide seguirme ("request") o que ya me sigue
// ("follower").
export default function FollowerActions({
  connectionId,
  kind,
}: {
  connectionId: string;
  kind: "request" | "follower";
}) {
  const [confirming, setConfirming] = useState(false);
  const { busy, error, run } = useApiAction();

  const respond = (action: "accept" | "decline") =>
    run(
      () =>
        fetch(`/api/connections/${connectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }),
      () => {}
    );

  const remove = () =>
    run(
      () => fetch(`/api/connections/${connectionId}`, { method: "DELETE" }),
      () => setConfirming(false)
    );

  return (
    <div className="flex flex-col items-end gap-1">
      {kind === "request" ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => respond("accept")}
            disabled={busy}
            className={`${primaryButtonClass} !py-2`}
          >
            {busy ? "..." : "Aceptar"}
          </button>
          <button
            onClick={() => respond("decline")}
            disabled={busy}
            className={link}
          >
            Rechazar
          </button>
        </div>
      ) : confirming ? (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted">¿Quitar seguidor?</span>
          <button
            onClick={remove}
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
      ) : (
        <button onClick={() => setConfirming(true)} className={link}>
          Quitar seguidor
        </button>
      )}
      {error && (
        <div className="text-xs text-red-600 max-w-[220px] text-right">
          {error}
        </div>
      )}
    </div>
  );
}
