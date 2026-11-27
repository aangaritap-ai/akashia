import { useTranslations } from "next-intl";
import { inputClass, labelClass } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import {
  MAX_FIRST_NAME,
  MAX_LAST_NAME,
  MAX_PHONE,
  PHONE_PATTERN,
} from "@/lib/contact";
import { MAX_CITY } from "@/lib/profile";

type Values = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
};

// Los campos obligatorios, para crear la cuenta y para completarla.
export default function ContactFields({ values = {} }: { values?: Values }) {
  const t = useTranslations("contact");
  const fields = [
    { name: "firstName", max: MAX_FIRST_NAME, auto: "given-name" },
    { name: "lastName", max: MAX_LAST_NAME, auto: "family-name" },
    { name: "phone", max: MAX_PHONE, auto: "tel" },
    { name: "city", max: MAX_CITY, auto: "address-level2" },
  ] as const;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ name, max, auto }) => (
          <div
            key={name}
            className={`flex min-w-0 flex-col gap-1.5 ${
              name === "phone" || name === "city" ? "col-span-2" : ""
            }`}
          >
            <label htmlFor={name} className={labelClass}>
              {t(name)}
            </label>
            <input
              id={name}
              name={name}
              type={name === "phone" ? "tel" : "text"}
              autoComplete={auto}
              maxLength={max}
              defaultValue={values[name]}
              required
              pattern={name === "phone" ? PHONE_PATTERN : undefined}
              placeholder={name === "phone" ? t("phonePlaceholder") : undefined}
              className={inputClass}
            />
            {name === "phone" && (
              <p className="text-xs text-muted">{t("phoneHint")}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// Autorización de datos: va justo antes del botón de enviar.
export function ConsentField() {
  const t = useTranslations("contact");

  return (
    <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted">
      <input
        type="checkbox"
        name="consent"
        required
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
      <span>
        {t.rich("consent", {
          privacy: (chunks) => (
            <Link
              href="/privacidad"
              target="_blank"
              className="text-accent hover:underline"
            >
              {chunks}
            </Link>
          ),
          terms: (chunks) => (
            <Link
              href="/terminos"
              target="_blank"
              className="text-accent hover:underline"
            >
              {chunks}
            </Link>
          ),
        })}
      </span>
    </label>
  );
}
