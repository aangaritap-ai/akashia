"use client";

import { useTranslations } from "next-intl";
import { LOCALE_NAMES, routing, type AppLocale } from "@/i18n/routing";

// En qué idioma saldrá el correo para alguien que quizá no tiene cuenta.
export default function MailLanguageSelect({
  value,
  onChange,
}: {
  value: AppLocale;
  onChange: (locale: AppLocale) => void;
}) {
  const t = useTranslations("mail");

  return (
    <label className="flex flex-col gap-1">
      <span className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {t("language")}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as AppLocale)}
          className="cursor-pointer rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground"
        >
          {routing.locales.map((code) => (
            <option key={code} value={code}>
              {LOCALE_NAMES[code]}
            </option>
          ))}
        </select>
      </span>
      <span className="text-xs text-muted">{t("accountHint")}</span>
    </label>
  );
}
