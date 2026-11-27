"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("datesPage");
  const common = useTranslations("common");

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={t("deleteLabel", { label })}
        className="text-xs text-muted hover:text-red-600 hover:underline shrink-0"
      >
        {common("delete")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs shrink-0">
      <span className={error ? "text-red-600" : "text-muted"}>
        {error ?? t("confirmDelete")}
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
        {busy ? common("deleting") : common("yes")}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-muted hover:underline"
      >
        {common("no")}
      </button>
    </div>
  );
}
