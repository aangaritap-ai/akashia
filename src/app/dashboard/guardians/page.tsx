import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requiredConfirmations, GRACE_PERIOD_HOURS } from "@/lib/delivery";
import AddGuardianForm from "@/components/AddGuardianForm";
import GuardianActions from "@/components/GuardianActions";
import CancelDeathButton from "@/components/CancelDeathButton";
import Avatar from "@/components/Avatar";
import { Callout, ListCard, PageHeader, StatusPill } from "@/components/ui";

export default async function GuardiansPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [guardians, me, guardingFor] = await Promise.all([
    prisma.guardian.findMany({
      where: { ownerId: userId },
      include: { confirmation: true },
      orderBy: { invitedAt: "asc" },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { deceasedPendingAt: true },
    }),
    prisma.guardian.findMany({
      where: { userId },
      include: { confirmation: true, owner: true },
      orderBy: { invitedAt: "asc" },
    }),
  ]);

  const confirmed = guardians.filter((g) => g.confirmation).length;
  const needed = requiredConfirmations(guardians.length);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tus guardianes"
        subtitle={
          <>
            Personas de tu confianza que, si llegas a faltar, confirman tu
            fallecimiento para que tus cápsulas &quot;al fallecer&quot; se
            entreguen.{" "}
            {guardians.length > 0 &&
              `Se necesitan ${needed} de ${guardians.length} confirmaciones.`}
          </>
        }
      />

      <AddGuardianForm />

      {me.deceasedPendingAt ? (
        <Callout tone="danger" className="flex flex-col gap-3">
          <p>
            Se completaron las confirmaciones. Las cápsulas se entregarán en{" "}
            {GRACE_PERIOD_HOURS} horas desde el{" "}
            {new Date(me.deceasedPendingAt).toLocaleString("es")} a menos
            que canceles esto.
          </p>
          <div className="self-start">
            <CancelDeathButton />
          </div>
        </Callout>
      ) : (
        confirmed > 0 && (
          <Callout tone="warning">
            {confirmed} de {needed} confirmaciones recibidas.
          </Callout>
        )
      )}

      <div className="flex flex-col gap-3">
        {guardians.map((g, i) => (
          <ListCard key={g.id} index={i}>
            <div className="flex items-center gap-4 min-w-0">
              <Avatar name={g.name} size="lg" />
              <div className="min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {g.name}
                </div>
                <div className="text-sm text-muted truncate">{g.email}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <StatusPill
                tone={
                  g.confirmation ? "danger" : g.userId ? "success" : "neutral"
                }
              >
                {g.confirmation
                  ? "Confirmó fallecimiento"
                  : g.userId
                    ? "Registrado"
                    : "Invitado (pendiente)"}
              </StatusPill>
              <GuardianActions id={g.id} canResend={!g.userId} />
            </div>
          </ListCard>
        ))}
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="font-display font-medium text-2xl text-foreground">
          Donde eres guardián
        </h2>
        <p className="text-sm text-muted mt-2 max-w-lg">
          Personas que te eligieron a ti como guardián de confianza.
        </p>

        {guardingFor.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-10 mt-4 text-center text-sm text-muted">
            Todavía nadie te ha designado como guardián.
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {guardingFor.map((g, i) => (
              <ListCard key={g.id} index={i}>
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar
                    name={g.owner.name}
                    src={g.owner.avatarUrl}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {g.owner.name}
                    </div>
                    <div className="text-sm text-muted truncate">
                      {g.owner.email}
                    </div>
                    {g.owner.deceasedPendingAt && (
                      <div className="text-xs text-red-700 mt-1">
                        Periodo de espera activo — se entrega en breve.
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusPill tone={g.confirmation ? "danger" : "success"}>
                    {g.confirmation ? "Confirmaste fallecimiento" : "Activo"}
                  </StatusPill>
                  <Link
                    href={`/guardian/${g.token}`}
                    className="text-xs text-accent font-semibold hover:underline"
                  >
                    Ver detalles →
                  </Link>
                </div>
              </ListCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
