import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requiredConfirmations } from "@/lib/delivery";
import AddGuardianForm from "@/components/AddGuardianForm";
import GuardianActions from "@/components/GuardianActions";

export default async function GuardiansPage() {
  const session = await auth();
  const userId = session!.user.id;

  const guardians = await prisma.guardian.findMany({
    where: { ownerId: userId },
    include: { confirmation: true },
    orderBy: { invitedAt: "asc" },
  });

  const confirmed = guardians.filter((g) => g.confirmation).length;
  const needed = requiredConfirmations(guardians.length);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-foreground">
          Tus guardianes
        </h1>
        <p className="text-sm text-muted mt-2 max-w-lg">
          Personas de tu confianza que, si llegas a faltar, confirman tu
          fallecimiento para que tus cápsulas &quot;al fallecer&quot; se
          entreguen.{" "}
          {guardians.length > 0 &&
            `Se necesitan ${needed} de ${guardians.length} confirmaciones.`}
        </p>
      </div>

      <AddGuardianForm />

      {confirmed > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {confirmed} de {needed} confirmaciones recibidas.
          {confirmed >= needed &&
            " Se activó la entrega de las cápsulas marcadas para el fallecimiento."}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {guardians.map((g) => (
          <div
            key={g.id}
            className="rounded-xl border border-border bg-surface px-5 py-4 flex items-center justify-between gap-4 shadow-sm"
          >
            <div>
              <div className="font-semibold text-foreground">{g.name}</div>
              <div className="text-sm text-muted">{g.email}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`text-xs rounded-full px-3 py-1 whitespace-nowrap ${
                  g.confirmation
                    ? "bg-red-50 text-red-700"
                    : g.userId
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-black/5 text-muted"
                }`}
              >
                {g.confirmation
                  ? "Confirmó fallecimiento"
                  : g.userId
                    ? "Registrado"
                    : "Invitado (pendiente)"}
              </span>
              <GuardianActions id={g.id} canResend={!g.userId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
