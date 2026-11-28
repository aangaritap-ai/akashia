import { useLocale, useTranslations } from "next-intl";
import { inputClass, labelClass } from "@/components/ui";
import { MIN_BIRTH_YEAR } from "@/lib/age";
import { monthName, todayIn } from "@/lib/special-dates";

// Día, mes y año en listas: en el celular es más fácil que un calendario.
export default function BirthDateField() {
  const t = useTranslations("age");
  const locale = useLocale();
  const thisYear = todayIn().year;
  const lists = [
    {
      name: "birthDay",
      label: t("day"),
      options: Array.from({ length: 31 }, (_, i) => [i + 1, String(i + 1)]),
    },
    {
      name: "birthMonth",
      label: t("month"),
      options: Array.from({ length: 12 }, (_, i) => [
        i + 1,
        monthName(i + 1, locale),
      ]),
    },
    {
      name: "birthYear",
      label: t("year"),
      options: Array.from({ length: thisYear - MIN_BIRTH_YEAR + 1 }, (_, i) => [
        thisYear - i,
        String(thisYear - i),
      ]),
    },
  ];

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className={`${labelClass} mb-1.5`}>{t("birthDate")}</legend>
      <div className="grid grid-cols-[1fr_1.5fr_1.2fr] gap-2">
        {lists.map(({ name, label, options }) => (
          <select
            key={name}
            name={name}
            aria-label={label}
            autoComplete={`bday-${name.slice(5).toLowerCase()}`}
            defaultValue=""
            required
            className={`${inputClass} min-w-0 !px-2`}
          >
            <option value="" disabled>
              {label}
            </option>
            {options.map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        ))}
      </div>
      <p className="text-xs text-muted">{t("hint")}</p>
    </fieldset>
  );
}
