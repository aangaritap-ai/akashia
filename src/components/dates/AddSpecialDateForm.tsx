"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import { useApiAction } from "@/components/useApiAction";
import {
  DATE_KINDS,
  MAX_DATE_TITLE,
  MIN_YEAR,
  monthName,
  type DateKind,
} from "@/lib/special-dates";

export default function AddSpecialDateForm() {
  const { busy, error, run } = useApiAction();
  const t = useTranslations("datesPage");
  const common = useTranslations("common");
  const locale = useLocale();
  const [kind, setKind] = useState<DateKind>("BIRTHDAY");
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(
      () =>
        fetch("/api/special-dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            title,
            day: Number(day),
            month: Number(month),
            year: year ? Number(year) : null,
          }),
        }),
      () => {
        setTitle("");
        setDay("");
        setMonth("");
        setYear("");
      }
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="reveal rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4 shadow-sm"
    >
      <h2 className="font-display font-medium text-xl text-foreground">
        {t("addTitle")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t("type")}</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DateKind)}
            className={inputClass}
          >
            {DATE_KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`kind${k}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>
            {kind === "OTHER" ? t("nameOther") : t("whose")}
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_DATE_TITLE}
            required
            placeholder={t(`hint${kind}`)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1.3fr)] gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t("day")}</span>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
            className={inputClass}
          >
            <option value="" disabled>
              —
            </option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t("month")}</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className={inputClass}
          >
            <option value="" disabled>
              —
            </option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {monthName(i + 1, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>{t("year")}</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_YEAR}
            max={new Date().getFullYear()}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={t("optional")}
            className={inputClass}
          />
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className={`${primaryButtonClass} self-start`}
      >
        {busy ? common("saving") : t("add")}
      </button>
    </form>
  );
}
