import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import CancelDeathButton from "@/components/CancelDeathButton";

export default async function CancelDeathPage({
  params,
}: PageProps<"/[locale]/cancel-death/[token]">) {
  const { token } = await params;

  const owner = await prisma.user.findUnique({
    where: { deceasedCancelToken: token },
    select: { name: true, deceasedPendingAt: true },
  });

  const t = await getTranslations("death");

  if (!owner) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md text-center">
          <p className="text-muted">
            {t("invalidLink")}
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
          {t("hello", { name: owner.name })}
        </h1>
        <p className="text-muted leading-relaxed">
          {t("ownerNotice")}
        </p>
        <CancelDeathButton token={token} />
      </div>
    </main>
  );
}
