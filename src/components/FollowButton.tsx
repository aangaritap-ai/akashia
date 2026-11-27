"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  StatusPill,
  blockPrimaryClass,
  blockSecondaryClass,
  primaryButtonClass,
} from "@/components/ui";
import { useApiAction } from "@/components/useApiAction";
import type { FollowState } from "@/lib/connections";

const link = "text-xs text-muted hover:underline disabled:opacity-50";

// Mi relación hacia otra persona: Seguir → Solicitud enviada → Siguiendo.
// "inline" va en una fila; "card", a lo ancho de una tarjeta.
export default function FollowButton({
  userId,
  initialState,
  initialConnectionId,
  variant = "inline",
}: {
  userId: string;
  initialState: FollowState;
  initialConnectionId: string | null;
  variant?: "inline" | "card";
}) {
  const [state, setState] = useState(initialState);
  const [connectionId, setConnectionId] = useState(initialConnectionId);
  const [confirming, setConfirming] = useState(false);
  const { busy, error, run } = useApiAction();
  const card = variant === "card";
  const t = useTranslations("followers");
  const common = useTranslations("common");

  const follow = () =>
    run<{ connection?: { id: string } }>(
      () =>
        fetch("/api/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }),
      (data) => {
        setConnectionId(data.connection?.id ?? null);
        setState("sent");
      }
    );

  const stop = () =>
    run(
      () => fetch(`/api/connections/${connectionId}`, { method: "DELETE" }),
      () => {
        setConnectionId(null);
        setConfirming(false);
        setState("none");
      }
    );

  let body: React.ReactNode;

  if (state === "none") {
    body = (
      <button
        type="button"
        onClick={follow}
        disabled={busy}
        className={
          card
            ? blockPrimaryClass
            : `${primaryButtonClass} !py-2 whitespace-nowrap`
        }
      >
        {busy ? common("sending") : t("follow")}
      </button>
    );
  } else if (confirming) {
    body = (
      <div
        className={`flex items-center gap-3 text-xs ${card ? "justify-center py-2" : ""}`}
      >
        <span className="text-muted">{t("confirmUnfollow")}</span>
        <button
          type="button"
          onClick={stop}
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
    );
  } else if (card) {
    body = (
      <button
        type="button"
        onClick={state === "sent" ? stop : () => setConfirming(true)}
        disabled={busy}
        className={blockSecondaryClass}
      >
        {state === "sent" ? t("cancelRequest") : t("unfollow")}
      </button>
    );
  } else if (state === "sent") {
    body = (
      <div className="flex items-center gap-3">
        <StatusPill tone="gold">{t("requestSent")}</StatusPill>
        <button type="button" onClick={stop} disabled={busy} className={link}>
          {common("cancel")}
        </button>
      </div>
    );
  } else {
    body = (
      <div className="flex items-center gap-3">
        <StatusPill tone="success">{t("following")}</StatusPill>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={link}
        >
          {t("unfollow")}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${card ? "" : "items-end"}`}>
      {body}
      {error && (
        <div
          className={`text-xs text-red-600 ${card ? "" : "max-w-[220px] text-right"}`}
        >
          {error}
        </div>
      )}
    </div>
  );
}
