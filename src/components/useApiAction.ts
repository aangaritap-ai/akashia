"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

// Llamada a la API con estado de "ocupado" y error legible; al terminar bien
// refresca los datos de la página.
export function useApiAction() {
  const router = useRouter();
  const t = useTranslations("common");
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
        setError(data.error || t("actionFailed"));
        return;
      }
      onOk(data as T);
      router.refresh();
    } catch {
      setError(t("offline"));
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, run };
}
