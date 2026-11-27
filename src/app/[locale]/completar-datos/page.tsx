import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import AuthShell from "@/components/AuthShell";
import ContactForm from "@/components/ContactForm";
import DeleteAccountSection from "@/components/DeleteAccountSection";
import { localizedPath } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { contactSelect, isContactComplete, splitName } from "@/lib/contact";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("meta") };
}

// Para cuentas que aún no tienen los datos obligatorios (las anteriores y las
// creadas con Google). Desde aquí también pueden eliminar la cuenta.
export default async function CompleteContactPage({
  searchParams,
}: PageProps<"/[locale]/completar-datos">) {
  const { eliminar } = await searchParams;
  const locale = await getLocale();
  const session = await auth();
  if (!session?.user?.id) redirect(localizedPath("/login", locale));

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: contactSelect,
  });
  if (!user) redirect(localizedPath("/login", locale));
  if (isContactComplete(user)) redirect(localizedPath("/inicio", locale));

  const t = await getTranslations("contact");

  return (
    <AuthShell title={t("completeTitle")} subtitle={t("completeSubtitle")}>
      <ContactForm
        values={{
          ...splitName(user.name, user.lastName),
          phone: user.phone ?? "",
          city: user.city ?? "",
        }}
      />
      <DeleteAccountSection
        returnTo="/completar-datos"
        error={typeof eliminar === "string" ? eliminar : undefined}
      />
    </AuthShell>
  );
}
