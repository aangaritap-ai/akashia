import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSelect } from "@/lib/profile";
import ProfileForm from "@/components/ProfileForm";
import { PageHeader } from "@/components/ui";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      ...profileSelect,
    },
  });

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <PageHeader
        title="Tu perfil"
        subtitle="Así te ven las personas que reciben tus mensajes. Todo lo nuevo es opcional."
        action={
          <Link
            href={`/memorial/${user.id}`}
            className="shrink-0 text-sm font-semibold text-accent hover:underline"
          >
            Ver mi página
          </Link>
        }
      />
      <ProfileForm
        initial={{
          name: user.name,
          avatarUrl: user.avatarUrl,
          coverUrl: user.coverUrl,
          bio: user.bio ?? "",
          motto: user.motto ?? "",
          city: user.city ?? "",
          showCity: user.showCity,
          birthMonth: user.birthMonth?.toString() ?? "",
          birthDay: user.birthDay?.toString() ?? "",
          shareBirthday: user.shareBirthday,
        }}
        email={user.email}
        memberSince={user.createdAt.toISOString()}
      />
    </div>
  );
}
