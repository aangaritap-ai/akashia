"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApiAction } from "@/components/useApiAction";
import { blockPrimaryClass, blockSecondaryClass } from "@/components/ui";
import { hideSuggestion } from "@/lib/hidden-suggestions";

// Confirmar o eliminar una solicitud para seguirme. "row" pone los botones lado
// a lado; "stack", uno debajo del otro.
export default function RequestButtons({
  connectionId,
  personId,
  layout = "row",
  onDone,
}: {
  connectionId: string;
  personId: string;
  layout?: "row" | "stack";
  onDone?: () => void;
}) {
  const [done, setDone] = useState<string | null>(null);
  const { busy, error, run } = useApiAction();
  const t = useTranslations("followers");

  const respond = (action: "accept" | "decline") =>
    run(
      () =>
        fetch(`/api/connections/${connectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }),
      () => {
        if (action === "decline") hideSuggestion(personId);
        setDone(action === "accept" ? t("accepted") : t("declined"));
        onDone?.();
      }
    );

  if (done) {
    return (
      <p role="status" className="text-sm text-muted py-1">
        {done}
      </p>
    );
  }

  return (
    <div className="relative z-10 flex flex-col gap-1">
      <div
        className={`flex gap-2 ${layout === "stack" ? "flex-col" : "flex-row"}`}
      >
        <button
          type="button"
          onClick={() => respond("accept")}
          disabled={busy}
          className={blockPrimaryClass}
        >
          {t("confirm")}
        </button>
        <button
          type="button"
          onClick={() => respond("decline")}
          disabled={busy}
          className={blockSecondaryClass}
        >
          {t("deleteRequest")}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
