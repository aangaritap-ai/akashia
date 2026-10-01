"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClearNotificationsButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function clearAll() {
    setLoading(true);
    await fetch("/api/notifications", { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">¿Borrar todas?</span>
        <button
          onClick={clearAll}
          disabled={loading}
          className="text-red-600 font-semibold hover:underline disabled:opacity-50"
        >
          {loading ? "Borrando..." : "Sí, borrar todas"}
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
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-muted hover:text-red-600"
    >
      Borrar todas
    </button>
  );
}
