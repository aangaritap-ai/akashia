import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { name: true, email: true, avatarUrl: true, createdAt: true },
  });

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <h1 className="font-display text-2xl text-foreground">Tu perfil</h1>
      <ProfileForm
        name={user.name}
        email={user.email}
        avatarUrl={user.avatarUrl}
        memberSince={user.createdAt.toISOString()}
      />
    </div>
  );
}
