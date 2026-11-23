import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemorialMessageForm from "@/components/MemorialMessageForm";
import MessageCard from "@/components/MessageCard";
import ProfileHeader from "@/components/ProfileHeader";

export default async function MemorialPage({
  params,
}: PageProps<"/memorial/[userId]">) {
  const { userId } = await params;

  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      memorialMessages: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!owner) notFound();

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14">
      <div className="w-full max-w-xl flex flex-col gap-8">
        <ProfileHeader
          name={owner.name}
          avatarUrl={owner.avatarUrl}
          eyebrow="Para"
          subtitle="Un espacio para recordar, celebrar una fecha especial, o simplemente agradecer."
          count={owner.memorialMessages.length}
        />

        <MemorialMessageForm userId={owner.id} />

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
