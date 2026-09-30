import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditCapsuleForm from "@/components/EditCapsuleForm";

export default async function EditCapsulePage({
  params,
}: PageProps<"/dashboard/capsules/[id]/edit">) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const capsule = await prisma.capsule.findUnique({
    where: { id },
    include: { recipients: true },
  });

  if (!capsule || capsule.ownerId !== userId) notFound();

  if (capsule.sealed || capsule.recipients.some((r) => r.delivered)) {
    redirect("/dashboard");
  }

  return (
    <EditCapsuleForm
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
        editCount: capsule.editCount,
        recipients: capsule.recipients.map((r) => ({
          name: r.name,
          email: r.email,
        })),
      }}
    />
  );
}
