"use client";

import { useState } from "react";
import { useApiAction } from "@/components/useApiAction";

export default function DeleteMessageButton({
  id,
  author,
}: {
  id: string;
  author: string;
}) {
  const { busy, error, run } = useApiAction();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Borrar el mensaje de ${author}`}
        className="text-xs text-muted hover:text-red-600 hover:underline"
      >
        Borrar
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs">
      <span role={error ? "alert" : undefined} className="text-red-700">
        {error ?? "¿Borrar para siempre?"}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          run(
            () => fetch(`/api/messages/${id}`, { method: "DELETE" }),
            () => {}
          )
        }
        className="font-semibold text-red-600 hover:underline disabled:opacity-50"
      >
        {busy ? "Borrando..." : "Sí, borrar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-muted hover:underline"
      >
        Cancelar
      </button>
    </span>
  );
}
