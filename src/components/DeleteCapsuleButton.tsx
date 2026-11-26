"use client";

import { useState } from "react";
import { useApiAction } from "@/components/useApiAction";

export default function DeleteCapsuleButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const { busy, error, run } = useApiAction();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Borrar la cápsula ${title}`}
        className="text-xs text-muted hover:text-red-600 hover:underline"
      >
        Borrar
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5 text-xs">
      <span
        role={error ? "alert" : undefined}
        className="max-w-[190px] text-right leading-snug text-red-700"
      >
        {error ?? "¿Borrar para siempre? Nadie la recibirá."}
      </span>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            run(
              () => fetch(`/api/capsules/${id}`, { method: "DELETE" }),
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
      </div>
    </div>
  );
}
