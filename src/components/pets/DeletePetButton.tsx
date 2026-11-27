"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function DeletePetButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const t = useTranslations("petsPage");
  const common = useTranslations("common");
  const messages = useTranslations("messages");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/pets/${id}`, { method: "DELETE" }).catch(
      () => null
    );
    if (!res?.ok) {
      setError(t("deleteFailed"));
      setBusy(false);
      return;
    }
    router.push("/dashboard/pets");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="self-start text-sm text-muted hover:text-red-600 hover:underline"
      >
        {t("deleteNamed", { name })}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>
        {t("deleteWarning")}
      </span>
      {error && <span role="alert">{error}</span>}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="font-semibold hover:underline disabled:opacity-60"
        >
          {busy ? common("deleting") : messages("yesDelete")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="hover:underline"
        >
          {common("cancel")}
        </button>
      </div>
    </div>
  );
}
