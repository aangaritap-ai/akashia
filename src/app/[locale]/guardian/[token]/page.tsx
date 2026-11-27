import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConfirmDeathButton from "@/components/ConfirmDeathButton";
import AcceptGuardianButton from "@/components/AcceptGuardianButton";

export default async function GuardianConfirmPage({
  params,
}: PageProps<"/[locale]/guardian/[token]">) {
  const { token } = await params;

  const guardian = await prisma.guardian.findUnique({
    where: { token },
    include: { owner: true, confirmation: true },
  });

  if (!guardian) notFound();
  const t = await getTranslations("death");
  const common = await getTranslations("common");
  const locale = await getLocale();
  const strong = (chunks: React.ReactNode) => (
    <strong className="text-foreground">{chunks}</strong>
  );

  const session = await auth();
  const callbackUrl = `/guardian/${token}`;
  const authLinks = (
    <div className="flex gap-3 justify-center">
      <Link
        href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(guardian.email)}`}
        className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-background hover:brightness-110"
      >
        {common("createAccount")}
      </Link>
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(guardian.email)}`}
        className="rounded-lg border border-border px-5 py-3 text-sm font-semibold hover:bg-black/[0.03]"
      >
        {t("haveAccount")}
      </Link>
    </div>
  );

  function renderAction() {
    if (guardian!.confirmation) {
      return (
        <div className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-muted">
          {t("alreadyConfirmed", {
            date: new Date(
              guardian!.confirmation.confirmedAt
            ).toLocaleDateString(locale),
          })}
        </div>
      );
    }

    if (!guardian!.userId) {
      // Not yet accepted: needs a registered account with the matching email.
      if (!session?.user) {
        return (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              {t.rich("needAccount", { email: guardian!.email, strong })}
            </p>
            {authLinks}
          </div>
        );
      }
      if (session.user.email?.toLowerCase() !== guardian!.email.toLowerCase()) {
        return (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-red-600">
              {t("wrongAccount", {
                email: guardian!.email,
                current: session.user.email ?? "",
              })}
            </p>
            {authLinks}
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            {t.rich("aboutToAccept", { name: guardian!.owner.name, strong })}
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
            {t.rich("alreadyAccepted", { email: guardian!.email, strong })}
          </p>
          {authLinks}
        </div>
      );
    }
    if (session.user.id !== guardian!.userId) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-red-600">
            {t("mustLogin", { email: guardian!.email })}
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
          {t("hello", { name: guardian.name })}
        </h1>
        <p className="text-muted leading-relaxed">
          {t.rich("role", { owner: guardian.owner.name, strong })}
        </p>

        {renderAction()}
      </div>
    </main>
  );
}
