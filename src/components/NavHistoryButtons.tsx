"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

export default function NavHistoryButtons() {
  const router = useRouter();
  const t = useTranslations("header");

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label={t("back")}
        className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-black/[0.04]"
      >
        <IconChevronLeft />
      </button>
      <button
        type="button"
        onClick={() => router.forward()}
        aria-label={t("forward")}
        className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-black/[0.04]"
      >
        <IconChevronRight />
      </button>
    </div>
  );
}
