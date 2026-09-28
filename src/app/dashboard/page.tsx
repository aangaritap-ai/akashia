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
      orderBy: { createdAt: "desc" },
    }),
    prisma.guardian.count({ where: { ownerId: userId } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-[#faf7f0]">Tus cápsulas</h1>
        <Link
          href="/dashboard/capsules/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#221806] hover:brightness-110"
        >
          + Nueva cápsula
        </Link>
      </div>

      {guardianCount === 0 && (
        <div className="rounded-xl border border-accent/30 bg-accent/10 px-5 py-4 text-sm text-[#f5e6c8] flex items-center justify-between gap-4">
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
        <div className="rounded-xl border border-border bg-white/[0.02] px-6 py-16 text-center text-muted">
          Todavía no has creado ninguna cápsula.
          <br />
          <Link href="/dashboard/capsules/new" className="text-accent">
            Crea la primera →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {capsules.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-white/[0.03] px-5 py-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-semibold text-[#faf7f0]">{c.title}</div>
                <div className="text-sm text-muted">
                  Para {c.recipientName} · {typeLabel[c.type]} ·{" "}
                  {c.triggerType === "DEATH"
                    ? "Al fallecer"
                    : `El ${new Date(c.triggerDate!).toLocaleDateString(
                        "es"
                      )}`}
                </div>
              </div>
              <div className="text-xs">
                {c.delivered ? (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-3 py-1">
                    Entregada
                  </span>
                ) : (
                  <span className="rounded-full bg-white/10 text-muted px-3 py-1">
                    Guardada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
