import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/Logo";

export default function Loading() {
  const t = useTranslations("common");

  return (
    <div
      role="status"
      className="flex-1 flex flex-col items-center justify-center gap-3 py-24"
    >
      <div className="float-soft">
        <LogoMark className="w-14 h-14" />
      </div>
      <p className="text-sm text-muted">{t("loading")}</p>
    </div>
  );
}
