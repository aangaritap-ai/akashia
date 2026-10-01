import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CancelDeathButton from "@/components/CancelDeathButton";

export default async function CancelDeathPage({
  params,
}: PageProps<"/cancel-death/[token]">) {
  const { token } = await params;

  const owner = await prisma.user.findUnique({
    where: { deceasedCancelToken: token },
    select: { name: true, deceasedPendingAt: true },
  });

  if (!owner) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md text-center">
          <p className="text-muted">
            Este enlace ya no es válido — es posible que ya se haya
            cancelado, o que la entrega ya se haya completado.
          </p>
        </div>
      </main>
    );
  }

  if (!owner.deceasedPendingAt) notFound();

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md flex flex-col gap-6 text-center">
        <h1 className="font-display text-2xl text-foreground">
          Hola, {owner.name}
        </h1>
        <p className="text-muted leading-relaxed">
          Tus guardianes confirmaron tu fallecimiento en Akashia. Si esto es
          un error, cancélalo ahora — tus mensajes todavía no se han
          entregado.
        </p>
        <CancelDeathButton token={token} />
      </div>
    </main>
  );
}
