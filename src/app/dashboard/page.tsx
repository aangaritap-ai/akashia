import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GRACE_PERIOD_HOURS } from "@/lib/delivery";
import CancelDeathButton from "@/components/CancelDeathButton";
import DeleteCapsuleButton from "@/components/DeleteCapsuleButton";
import { capsuleLockReason } from "@/lib/capsules";
import { LogoMark } from "@/components/Logo";
import { IconCalendar, IconMemorial } from "@/components/icons";
import {
  Callout,
  ListCard,
  PageHeader,
  StatusPill,
  primaryButtonClass,
} from "@/components/ui";

const typeLabel: Record<string, string> = {
  TEXT: "Texto",
  AUDIO: "Audio",
  VIDEO: "Video",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [capsules, guardianCount, me] = await Promise.all([
    prisma.capsule.findMany({
      where: { ownerId: userId },
      include: { recipients: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.guardian.count({ where: { ownerId: userId } }),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { deceasedPendingAt: true, isDeceased: true },
    }),
  ]);
  const locked = capsuleLockReason(me) !== null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tus cápsulas"
        subtitle="Mensajes que dejas guardados para el momento justo."
        action={
          <Link
            href="/dashboard/capsules/new"
            className={`${primaryButtonClass} shrink-0`}
          >
            + Nueva cápsula
          </Link>
        }
      />

      {me.deceasedPendingAt && (
        <Callout tone="danger" className="flex flex-col gap-3">
          <p>
            Tus guardianes confirmaron tu fallecimiento el{" "}
            {new Date(me.deceasedPendingAt).toLocaleString("es")}. Tus
            cápsulas se entregarán en {GRACE_PERIOD_HOURS} horas desde ese
            momento a menos que canceles esto.
          </p>
          <div className="self-start">
            <CancelDeathButton />
          </div>
        </Callout>
      )}

      {guardianCount === 0 && (
        <Callout
          tone="info"
          className="flex items-center justify-between gap-4"
        >
          <span>
            Aún no tienes guardianes. Sin ellos, tus cápsulas &quot;al
            fallecer&quot; nunca podrán entregarse.
          </span>
          <Link
            href="/dashboard/guardians"
            className="whitespace-nowrap font-semibold text-accent hover:underline"
          >
            Añadir guardián →
          </Link>
        </Callout>
      )}

      {capsules.length === 0 ? (
        <div className="reveal rounded-2xl border border-border bg-surface px-6 py-14 text-center flex flex-col items-center gap-4 shadow-sm">
          <LogoMark className="w-20 h-20" variant="detail" />
          <div>
            <h2 className="font-display text-xl text-foreground">
              Tu primera cápsula te espera
            </h2>
            <p className="text-sm text-muted mt-2 max-w-sm leading-relaxed">
              Escribe unas palabras para alguien que amas y elige cuándo
              deben llegar.
            </p>
          </div>
          <Link href="/dashboard/capsules/new" className={primaryButtonClass}>
            Crear la primera
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {capsules.map((c, i) => {
            const allDelivered =
              c.recipients.length > 0 &&
              c.recipients.every((r) => r.delivered);
            const someDelivered = c.recipients.some((r) => r.delivered);
            const isDeath = c.triggerType === "DEATH";
            return (
              <ListCard key={c.id} index={i}>
                <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-11 h-11 shrink-0 rounded-full bg-gold/15 text-[#7a5c2e] flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {isDeath ? (
                        <IconMemorial className="w-5 h-5" />
                      ) : (
                        <IconCalendar className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {c.title}
                      </div>
                      <div className="text-sm text-muted">
                        Para {c.recipients.map((r) => r.name).join(", ")}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {typeLabel[c.type]} ·{" "}
                        {isDeath
                          ? "Al fallecer"
                          : `El ${new Date(c.triggerDate!).toLocaleDateString(
                              "es"
                            )}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:shrink-0 sm:flex-col sm:items-end">
                    {allDelivered ? (
                      <StatusPill tone="success">Entregada</StatusPill>
                    ) : someDelivered ? (
                      <StatusPill tone="warning">
                        Entregada parcialmente
                      </StatusPill>
                    ) : (
                      <StatusPill>Guardada</StatusPill>
                    )}
                    {!someDelivered && !locked && (
                      <div className="flex items-start gap-3">
                        <Link
                          href={`/dashboard/capsules/${c.id}/edit`}
                          className="text-xs text-accent font-semibold hover:underline"
                        >
                          Editar
                        </Link>
                        <DeleteCapsuleButton id={c.id} title={c.title} />
                      </div>
                    )}
                  </div>
                </div>
              </ListCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
