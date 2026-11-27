import { redirect } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { localizedPath } from "@/i18n/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeAccount } from "@/lib/account";
import { deleteFiles } from "@/lib/own-files";
import { Callout, inputClass } from "@/components/ui";

// Eliminar la propia cuenta, desde el perfil.
export default function DeleteAccountSection({ error }: { error?: string }) {
  const t = useTranslations("deleteAccount");
  // La palabra de confirmación, en el idioma en que se muestra la página.
  const word = t("word");
  const locale = useLocale();

  async function deleteAccount(formData: FormData) {
    "use server";
    // La cuenta sale de la sesión, nunca del formulario.
    const session = await auth();
    if (!session?.user?.id) redirect(localizedPath("/login", locale));

    if (String(formData.get("confirm") ?? "").trim() !== word) {
      redirect(localizedPath("/dashboard/profile?eliminar=palabra", locale));
    }
    const result = await prisma.$transaction(
      (tx) => removeAccount(session.user.id, tx),
      { timeout: 30_000, maxWait: 15_000 }
    );
    if ("error" in result) {
      redirect(localizedPath("/dashboard/profile?eliminar=bloqueada", locale));
    }

    await deleteFiles(result.files);
    await signOut({ redirectTo: localizedPath("/", locale) });
  }

  return (
    <details
      open={Boolean(error)}
      className="rounded-2xl border border-border bg-surface px-5 py-4"
    >
      <summary className="cursor-pointer text-sm font-semibold text-red-700">
        {t("summary")}
      </summary>
      <div className="mt-3 flex flex-col gap-3 text-sm text-foreground">
        {error && (
          <Callout tone="danger" className="!py-3">
            {error === "palabra"
              ? t("wrongWord", { word })
              : t("blocked")}
          </Callout>
        )}
        <p className="leading-relaxed">
          {t.rich("warning", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <form action={deleteAccount} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span>
              {t.rich("typeToConfirm", {
                word,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </span>
            <input
              name="confirm"
              required
              autoComplete="off"
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </details>
  );
}
