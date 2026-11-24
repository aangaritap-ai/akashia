"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Llamada a la API con estado de "ocupado" y error legible; al terminar bien
// refresca los datos de la página.
export function useApiAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(
    request: () => Promise<Response>,
    onOk: (data: T) => void
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
      onOk(data as T);
      router.refresh();
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, run };
}
