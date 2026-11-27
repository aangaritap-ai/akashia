"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApiAction } from "@/components/useApiAction";
import { blockSecondaryClass } from "@/components/ui";
import { hideSuggestion } from "@/lib/hidden-suggestions";

// Quitar a alguien que ya me sigue.
export default function RemoveFollowerButton({
  connectionId,
  personId,
}: {
  connectionId: string;
  personId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const { busy, error, run } = useApiAction();
  const t = useTranslations("followers");
  const common = useTranslations("common");

  const remove = () =>
    run(
      () => fetch(`/api/connections/${connectionId}`, { method: "DELETE" }),
      () => {
        hideSuggestion(personId);
        setConfirming(false);
      }
    );

  return (
    <div className="flex flex-col gap-1">
      {confirming ? (
        <div className="flex items-center justify-center gap-3 py-2 text-xs">
          <span className="text-muted">{t("confirmRemove")}</span>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="text-red-600 font-semibold hover:underline disabled:opacity-50"
          >
            {busy ? "..." : common("yes")}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-muted hover:underline"
          >
            {common("no")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={blockSecondaryClass}
        >
          {t("removeFollower")}
        </button>
      )}
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
