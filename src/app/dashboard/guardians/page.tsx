import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requiredConfirmations } from "@/lib/delivery";
import AddGuardianForm from "@/components/AddGuardianForm";

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
        <h1 className="font-display text-2xl text-[#faf7f0]">
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
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
          {confirmed} de {needed} confirmaciones recibidas.
          {confirmed >= needed &&
            " Se activó la entrega de las cápsulas marcadas para el fallecimiento."}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {guardians.map((g) => (
          <div
            key={g.id}
            className="rounded-xl border border-border bg-white/[0.03] px-5 py-4 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-[#faf7f0]">{g.name}</div>
              <div className="text-sm text-muted">{g.email}</div>
            </div>
            <span
              className={`text-xs rounded-full px-3 py-1 ${
                g.confirmation
                  ? "bg-red-500/15 text-red-300"
                  : "bg-white/10 text-muted"
              }`}
            >
              {g.confirmation ? "Confirmó fallecimiento" : "Invitado"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
