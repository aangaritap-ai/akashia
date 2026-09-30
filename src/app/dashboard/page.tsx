import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const typeLabel: Record<string, string> = {
  TEXT: "Texto",
  AUDIO: "Audio",
  VIDEO: "Video",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [capsules, guardianCount] = await Promise.all([
    prisma.capsule.findMany({
      where: { ownerId: userId },
      include: { recipients: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.guardian.count({ where: { ownerId: userId } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">Tus cápsulas</h1>
        <Link
          href="/dashboard/capsules/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:brightness-110"
        >
          + Nueva cápsula
        </Link>
      </div>

      {guardianCount === 0 && (
        <div className="rounded-xl border border-accent/20 bg-accent/[0.06] px-5 py-4 text-sm text-accent flex items-center justify-between gap-4">
          <span>
            Aún no tienes guardianes. Sin ellos, tus cápsulas &quot;al
            fallecer&quot; nunca podrán entregarse.
          </span>
          <Link
            href="/dashboard/guardians"
            className="whitespace-nowrap font-semibold text-accent"
          >
            Añadir guardián →
          </Link>
        </div>
      )}

      {capsules.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center text-muted">
          Todavía no has creado ninguna cápsula.
          <br />
          <Link href="/dashboard/capsules/new" className="text-accent">
            Crea la primera →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {capsules.map((c) => {
            const allDelivered =
              c.recipients.length > 0 &&
              c.recipients.every((r) => r.delivered);
            const someDelivered = c.recipients.some((r) => r.delivered);
            return (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-surface px-5 py-4 flex items-center justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="font-semibold text-foreground">
                    {c.title}
                  </div>
                  <div className="text-sm text-muted">
                    Para {c.recipients.map((r) => r.name).join(", ")} ·{" "}
                    {typeLabel[c.type]} ·{" "}
                    {c.triggerType === "DEATH"
                      ? "Al fallecer"
                      : `El ${new Date(c.triggerDate!).toLocaleDateString(
                          "es"
                        )}`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-xs">
                  {allDelivered ? (
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1">
                      Entregada
                    </span>
                  ) : someDelivered ? (
                    <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1">
                      Entregada parcialmente
                    </span>
                  ) : (
                    <span className="rounded-full bg-black/5 text-muted px-3 py-1">
                      Guardada
                    </span>
                  )}
                  {!someDelivered &&
                    (c.sealed ? (
                      <span className="text-muted">Sellada</span>
                    ) : (
                      <Link
                        href={`/dashboard/capsules/${c.id}/edit`}
                        className="text-accent font-semibold hover:underline"
                      >
                        Editar
                      </Link>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
