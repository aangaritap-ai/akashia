import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ConfirmDeathButton from "@/components/ConfirmDeathButton";

export default async function GuardianConfirmPage({
  params,
}: PageProps<"/guardian/[token]">) {
  const { token } = await params;

  const guardian = await prisma.guardian.findUnique({
    where: { token },
    include: { owner: true, confirmation: true },
  });

  if (!guardian) notFound();

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md flex flex-col gap-6 text-center">
        <div className="font-display text-xl text-[#faf7f0]">Akashia</div>
        <h1 className="font-display text-2xl text-[#faf7f0]">
          Hola, {guardian.name}
        </h1>
        <p className="text-muted leading-relaxed">
          <strong className="text-foreground">{guardian.owner.name}</strong>{" "}
          te designó como guardián en Akashia. Esta página solo debe usarse
          para confirmar que {guardian.owner.name} ha fallecido — al
          hacerlo, ayudas a que sus mensajes lleguen a las personas que ama.
        </p>

        {guardian.confirmation ? (
          <div className="rounded-xl border border-border bg-white/[0.03] px-5 py-4 text-sm text-muted">
            Ya confirmaste esto el{" "}
            {new Date(guardian.confirmation.confirmedAt).toLocaleDateString(
              "es"
            )}
            .
          </div>
        ) : (
          <ConfirmDeathButton token={token} />
        )}
      </div>
    </main>
  );
}
