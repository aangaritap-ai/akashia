"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import BirthDateField from "@/components/BirthDateField";
import ContactFields, { ConsentField } from "@/components/ContactFields";
import { Callout, primaryButtonClass } from "@/components/ui";
import { useRouter } from "@/i18n/navigation";

// Completar los datos obligatorios de una cuenta que ya existe.
export default function ContactForm({
  values,
  askAge,
}: {
  // Falta comprobar la edad (cuentas nuevas que entran con Google).
  askAge: boolean;
  values: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
  };
}) {
  const router = useRouter();
  const t = useTranslations("contact");
  const common = useTranslations("common");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          phone: form.get("phone"),
          city: form.get("city"),
          birthDay: form.get("birthDay"),
          birthMonth: form.get("birthMonth"),
          birthYear: form.get("birthYear"),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || common("actionFailed"));
        setBusy(false);
        return;
      }
      router.replace("/inicio");
      router.refresh();
    } catch {
      setError(common("offline"));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && (
        <Callout tone="danger" className="!py-3">
          {error}
        </Callout>
      )}
      <ContactFields values={values} />
      {askAge && <BirthDateField />}
      <ConsentField />
      <button type="submit" disabled={busy} className={primaryButtonClass}>
        {busy ? common("saving") : t("save")}
      </button>
    </form>
  );
}
