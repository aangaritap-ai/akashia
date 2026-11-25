"use client";

import { useState } from "react";
import { useApiAction } from "@/components/useApiAction";

export default function DeleteDateButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const { busy, error, run } = useApiAction();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Borrar: ${label}`}
        className="text-xs text-muted hover:text-red-600 hover:underline shrink-0"
      >
        Borrar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs shrink-0">
      <span className={error ? "text-red-600" : "text-muted"}>
        {error ?? "¿Borrar?"}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          run(
            () => fetch(`/api/special-dates/${id}`, { method: "DELETE" }),
            () => {}
          )
        }
        className="text-red-600 font-semibold hover:underline disabled:opacity-50"
      >
        {busy ? "Borrando..." : "Sí"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-muted hover:underline"
      >
        No
      </button>
    </div>
  );
}
