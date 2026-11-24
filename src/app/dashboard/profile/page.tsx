import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";
import { PageHeader } from "@/components/ui";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { name: true, email: true, avatarUrl: true, createdAt: true },
  });

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <PageHeader
        title="Tu perfil"
        subtitle="Así te ven las personas que reciben tus mensajes."
      />
      <ProfileForm
        name={user.name}
        email={user.email}
        avatarUrl={user.avatarUrl}
        memberSince={user.createdAt.toISOString()}
      />
    </div>
  );
}
