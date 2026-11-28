import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditCapsuleForm from "@/components/EditCapsuleForm";
import { capsuleLockReason } from "@/lib/capsules";
import { toLocale } from "@/lib/translator";
import { followersOf } from "@/lib/connections";
import { recipientRows } from "@/lib/recipients-db";
import { firstDeliveryDate } from "@/lib/special-dates";

export default async function EditCapsulePage({
  params,
}: PageProps<"/[locale]/dashboard/capsules/[id]/edit">) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const capsule = await prisma.capsule.findUnique({
    where: { id },
    include: { recipients: true, owner: true },
  });

  if (!capsule || capsule.ownerId !== userId) notFound();

  if (
    capsuleLockReason(capsule.owner) ||
    capsule.recipients.some((r) => r.delivered)
  ) {
    redirect("/dashboard");
  }

  const [followers, guardianCount, recipients] = await Promise.all([
    followersOf(userId),
    prisma.guardian.count({ where: { ownerId: userId } }),
    recipientRows(userId, capsule.recipients),
  ]);

  return (
    <EditCapsuleForm
      followers={followers}
      guardianCount={guardianCount}
      minDate={firstDeliveryDate()}
      capsule={{
        id: capsule.id,
        title: capsule.title,
        type: capsule.type,
        textContent: capsule.textContent,
        mediaUrl: capsule.mediaUrl,
        triggerType: capsule.triggerType,
        triggerDate: capsule.triggerDate
          ? capsule.triggerDate.toISOString().slice(0, 10)
          : "",
        locale: capsule.recipients[0]?.locale
          ? toLocale(capsule.recipients[0].locale)
          : null,
        recipients,
      }}
    />
  );
}
