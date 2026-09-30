import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConfirmDeathButton from "@/components/ConfirmDeathButton";
import AcceptGuardianButton from "@/components/AcceptGuardianButton";

export default async function GuardianConfirmPage({
  params,
}: PageProps<"/guardian/[token]">) {
  const { token } = await params;

  const guardian = await prisma.guardian.findUnique({
    where: { token },
    include: { owner: true, confirmation: true },
  });

  if (!guardian) notFound();

  const session = await auth();
  const callbackUrl = `/guardian/${token}`;
  const authLinks = (
    <div className="flex gap-3 justify-center">
      <Link
        href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(guardian.email)}`}
        className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background hover:brightness-110"
      >
        Crear cuenta
      </Link>
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(guardian.email)}`}
        className="rounded-lg border border-border px-5 py-3 text-sm font-semibold hover:bg-black/[0.03]"
      >
        Ya tengo cuenta
      </Link>
    </div>
  );

  function renderAction() {
    if (guardian!.confirmation) {
      return (
        <div className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-muted">
          Ya confirmaste esto el{" "}
          {new Date(guardian!.confirmation.confirmedAt).toLocaleDateString(
            "es"
          )}
          .
        </div>
      );
    }

    if (!guardian!.userId) {
      // Not yet accepted: needs a registered account with the matching email.
      if (!session?.user) {
        return (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              Para ser guardián necesitas una cuenta en Akashia con el correo{" "}
              <strong className="text-foreground">{guardian!.email}</strong>.
            </p>
            {authLinks}
          </div>
        );
      }
      if (session.user.email?.toLowerCase() !== guardian!.email.toLowerCase()) {
        return (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-red-600">
              Esta invitación es para {guardian!.email}. Estás conectado como{" "}
              {session.user.email}.
            </p>
            {authLinks}
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Estás a punto de aceptar ser guardián de{" "}
            <strong className="text-foreground">{guardian!.owner.name}</strong>.
          </p>
          <AcceptGuardianButton token={token} />
        </div>
      );
    }

    // Already accepted: confirming death requires being logged in as that same account.
    if (!session?.user) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Ya aceptaste este rol. Inicia sesión con{" "}
            <strong className="text-foreground">{guardian!.email}</strong>{" "}
            para poder confirmar un fallecimiento cuando sea necesario.
          </p>
          {authLinks}
        </div>
      );
    }
    if (session.user.id !== guardian!.userId) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-red-600">
            Debes iniciar sesión como {guardian!.email} para actuar aquí.
          </p>
          {authLinks}
        </div>
      );
    }
    return <ConfirmDeathButton token={token} />;
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md flex flex-col gap-6 text-center">
        <div className="font-display text-xl text-foreground">Akashia</div>
        <h1 className="font-display text-2xl text-foreground">
          Hola, {guardian.name}
        </h1>
        <p className="text-muted leading-relaxed">
          <strong className="text-foreground">{guardian.owner.name}</strong>{" "}
          te designó como guardián en Akashia. Este rol te permite confirmar,
          junto a otros guardianes, que {guardian.owner.name} ha fallecido —
          eso es lo que activa la entrega de sus mensajes.
        </p>

        {renderAction()}
      </div>
    </main>
  );
}
