"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/Logo";
import { blockPrimaryClass, blockSecondaryClass } from "@/components/ui";
import { installPlatform } from "@/lib/install-platform";

/** Los pasos para instalar cuando el botón no puede hacerlo solo. */
export default function InstallDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("install");
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Solo se abre con un clic, así que siempre estamos en el navegador.
  const platform = installPlatform(
    navigator.userAgent,
    navigator.maxTouchPoints
  );
  const address = window.location.origin;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previous?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const steps = {
    ios: [t("ios1"), t("ios2"), t("ios3")],
    android: [t("android1"), t("android2"), t("android3")],
    macSafari: [t("mac1"), t("mac2")],
    desktop: [t("desktop1"), t("desktop2")],
    firefox: null,
    inApp: null,
  }[platform];

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      // La dirección queda a la vista para copiarla a mano.
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-full w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-2xl bg-surface p-5 text-left shadow-xl">
        <div className="flex items-center gap-3">
          <LogoMark className="w-10 h-10 shrink-0" />
          <h2
            id="install-title"
            className="font-display font-medium text-2xl text-foreground"
          >
            {t("button")}
          </h2>
        </div>

        {steps ? (
          <>
            <p className="text-sm text-muted">
              {platform === "ios" ? t("iosIntro") : t("stepsIntro")}
            </p>
            <ol className="flex flex-col gap-3">
              {steps.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted">{t("already")}</p>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-foreground">
              {platform === "inApp" ? t("inApp") : t("firefox")}
            </p>
            <p className="select-all break-all rounded-lg bg-black/[0.04] px-3 py-2 text-sm">
              {address}
            </p>
            <button type="button" onClick={copy} className={blockPrimaryClass}>
              {copied ? t("copied") : t("copy")}
            </button>
          </>
        )}

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className={blockSecondaryClass}
        >
          {t("close")}
        </button>
      </div>
    </div>,
    document.body
  );
}
