"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconDownload } from "@/components/icons";
import InstallDialog from "@/components/install/InstallDialog";
import { promptInstall, useCanOfferInstall } from "@/components/install/store";
import { primaryButtonClass } from "@/components/ui";

/** Instala Akashia; si el navegador no lo permite, muestra los pasos. */
export default function InstallButton({
  className = primaryButtonClass,
}: {
  className?: string;
}) {
  const t = useTranslations("install");
  const available = useCanOfferInstall();
  const [help, setHelp] = useState(false);

  if (!available) return null;

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (!(await promptInstall())) setHelp(true);
        }}
        className={`inline-flex items-center justify-center gap-2 ${className}`}
      >
        <IconDownload className="w-5 h-5" />
        {t("button")}
      </button>
      {help && <InstallDialog onClose={() => setHelp(false)} />}
    </>
  );
}
