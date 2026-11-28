"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type TriggerType = "DATE" | "DEATH";

/** "¿Cuándo se entrega?". Solo "Cuando yo falte" depende de los guardianes. */
export default function WhenField({
  type,
  onType,
  date,
  onDate,
  minDate,
  guardianCount,
}: {
  type: TriggerType;
  onType: (type: TriggerType) => void;
  date: string;
  onDate: (date: string) => void;
  /** El primer día que se puede elegir (mañana). */
  minDate: string;
  guardianCount: number;
}) {
  const t = useTranslations("capsules");
  const options = [
    { value: "DATE", label: t("whenDate") },
    { value: "DEATH", label: t("whenGone") },
  ] as const;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-muted">{t("when")}</span>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onType(option.value)}
            aria-pressed={type === option.value}
            className={`rounded-lg px-4 py-2 text-sm border ${
              type === option.value
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {type === "DATE" ? (
        <>
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => onDate(e.target.value)}
            required
            aria-label={t("whenDate")}
            className="mt-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <p className="text-xs text-muted mt-1">{t("dateHint")}</p>
        </>
      ) : (
        <>
          <p className="text-xs text-muted mt-1">{t("deathHint")}</p>
          {guardianCount === 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {t("deathNoGuardians")}{" "}
              {/* En otra pestaña, para no perder lo escrito. */}
              <Link
                href="/dashboard/guardians"
                target="_blank"
                className="font-semibold underline"
              >
                {t("addGuardian")}
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
