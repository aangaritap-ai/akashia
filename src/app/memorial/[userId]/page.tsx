import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { followBetween } from "@/lib/connections";
import FollowButton from "@/components/FollowButton";
import MemorialMessageForm from "@/components/MemorialMessageForm";
import MessageCard from "@/components/MessageCard";
import ProfileHeader from "@/components/ProfileHeader";
import { profileDetails, profileSelect } from "@/lib/profile";

export default async function MemorialPage({
  params,
}: PageProps<"/memorial/[userId]">) {
  const { userId } = await params;

  // La página es pública, pero los mensajes privados solo los ve su dueño.
  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const isOwner = viewerId === userId;

  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      ...profileSelect,
      memorialMessages: {
        where: { petId: null, ...(isOwner ? {} : { isPublic: true }) },
        orderBy: { createdAt: "desc" },
      },
      pets: {
        select: { id: true, name: true, photoUrl: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!owner) notFound();

  // Solo quien tiene sesión puede seguir.
  const follow =
    viewerId && !isOwner
      ? await followBetween(viewerId, owner.id)
      : null;

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14">
      <div className="w-full max-w-xl flex flex-col gap-8">
        <ProfileHeader
          name={owner.name}
          avatarUrl={owner.avatarUrl}
          // El cumpleaños lo ven la persona y sus seguidores aprobados.
          {...profileDetails(
            owner,
            isOwner || follow?.state === "following"
          )}
          eyebrow="Para"
          subtitle="Un espacio para recordar, celebrar una fecha especial, o simplemente agradecer."
          count={owner.memorialMessages.length}
        />

        {follow && (
          <div className="flex justify-end -mt-4">
            <FollowButton
              userId={owner.id}
              initialState={follow.state}
              initialConnectionId={follow.connectionId}
            />
          </div>
        )}

        {owner.pets.length > 0 && (
          <section
            aria-label="Huellitas"
            className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm"
          >
            <h2 className="font-display font-medium text-lg text-foreground">
              Sus huellitas
            </h2>
            <ul className="mt-3 flex flex-wrap gap-4">
              {owner.pets.map((pet) => (
                <li key={pet.id}>
                  <Link
                    href={`/huellitas/${pet.id}`}
                    className="flex w-20 flex-col items-center gap-1.5 text-center"
                  >
                    <Avatar name={pet.name} src={pet.photoUrl} size="lg" />
                    <span className="w-full truncate text-xs text-foreground">
                      {pet.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <MemorialMessageForm
          userId={owner.id}
          canAttachPhoto={Boolean(viewerId)}
          ownerName={owner.name}
          isOwner={isOwner}
        />

        <div className="flex flex-col gap-4">
          {owner.memorialMessages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-6 py-10 text-center text-muted">
              Sé el primero en dejar un mensaje.
            </div>
          ) : (
            owner.memorialMessages.map((m, i) => (
              <MessageCard key={m.id} m={m} index={i} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
