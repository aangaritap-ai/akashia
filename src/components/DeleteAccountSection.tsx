import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DELETE_WORD, removeAccount } from "@/lib/account";
import { deleteFiles } from "@/lib/own-files";
import { Callout, inputClass } from "@/components/ui";

// Eliminar la propia cuenta, desde el perfil.
export default function DeleteAccountSection({ error }: { error?: string }) {
  async function deleteAccount(formData: FormData) {
    "use server";
    // La cuenta sale de la sesión, nunca del formulario.
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    if (String(formData.get("confirm") ?? "").trim() !== DELETE_WORD) {
      redirect("/dashboard/profile?eliminar=palabra");
    }
    const result = await prisma.$transaction(
      (tx) => removeAccount(session.user.id, tx),
      { timeout: 30_000, maxWait: 15_000 }
    );
    if ("error" in result) redirect("/dashboard/profile?eliminar=bloqueada");

    await deleteFiles(result.files);
    await signOut({ redirectTo: "/" });
  }

  return (
    <details
      open={Boolean(error)}
      className="rounded-2xl border border-border bg-surface px-5 py-4"
    >
      <summary className="cursor-pointer text-sm font-semibold text-red-700">
        Eliminar mi cuenta
      </summary>
      <div className="mt-3 flex flex-col gap-3 text-sm text-foreground">
        {error && (
          <Callout tone="danger" className="!py-3">
            {error === "palabra"
              ? `Para confirmar escribe ${DELETE_WORD}, en mayúsculas.`
              : "Hay una confirmación de fallecimiento sobre tu cuenta. Cancélala antes de eliminarla."}
          </Callout>
        )}
        <p className="leading-relaxed">
          Se borran para siempre tu perfil, cápsulas, historias, mascotas,
          fechas y los mensajes de tus páginas. Las cápsulas que no se hayan
          entregado <strong>no le llegarán a nadie</strong>. Quien ya recibió
          una conserva su enlace. Las copias de seguridad desaparecen en unos
          tres meses.
        </p>
        <form action={deleteAccount} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span>
              Escribe <strong>{DELETE_WORD}</strong> para confirmar
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
            Eliminar mi cuenta para siempre
          </button>
        </form>
      </div>
    </details>
  );
}
