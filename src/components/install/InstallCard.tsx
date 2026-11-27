"use client";

import { useTranslations } from "next-intl";
import InstallButton from "@/components/install/InstallButton";
import {
  hideCard,
  useCanOfferInstall,
  useCardHidden,
} from "@/components/install/store";
import { LogoMark } from "@/components/Logo";

/** Invitación a instalar. En Inicio se puede cerrar; en el perfil queda fija. */
export default function InstallCard({
  dismissible = false,
}: {
  dismissible?: boolean;
}) {
  const t = useTranslations("install");
  const available = useCanOfferInstall();
  const hidden = useCardHidden();

  if (!available || (dismissible && hidden)) return null;

  return (
    <section
      aria-label={t("cardTitle")}
      className="relative flex flex-col gap-3 rounded-2xl border border-gold/40 bg-surface px-4 py-4 shadow-sm"
    >
      <div className={`flex items-start gap-3 ${dismissible ? "pr-8" : ""}`}>
        <LogoMark className="w-10 h-10 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {t("cardTitle")}
          </h2>
          <p className="text-xs leading-relaxed text-muted">{t("cardBody")}</p>
        </div>
      </div>
      <InstallButton />
      {dismissible && (
        <button
          type="button"
          onClick={hideCard}
          aria-label={t("dismiss")}
          title={t("dismiss")}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-muted hover:bg-black/[0.05] hover:text-foreground"
        >
          ×
        </button>
      )}
    </section>
  );
}
