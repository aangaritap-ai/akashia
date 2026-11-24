import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVisibleStories } from "@/lib/stories";
import MessageCard from "@/components/MessageCard";
import StoriesBar from "@/components/stories/StoriesBar";

export default async function MemorialFeedPage() {
  // El feed es público; las historias solo aparecen con sesión iniciada.
  const session = await auth();
  const viewerId = session?.user?.id ?? null;

  const [messages, viewer, storyGroups] = await Promise.all([
    prisma.memorialMessage.findMany({
      where: { isPublic: true },
      include: { owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    viewerId
      ? prisma.user.findUnique({
          where: { id: viewerId },
          select: { id: true, name: true, avatarUrl: true },
        })
      : null,
    viewerId ? getVisibleStories(viewerId) : [],
  ]);

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-xl flex flex-col gap-8">
        {viewer && (
          <div className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm">
            <StoriesBar groups={storyGroups} me={viewer} />
          </div>
        )}

        <div className="text-center flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-[0.16em] uppercase text-gold">
            Comunidad
          </div>
          <h1 className="font-display font-medium text-4xl text-foreground">
            Feed de recuerdos
          </h1>
          <p className="text-muted leading-relaxed">
            Mensajes públicos que la comunidad de Akashia ha dejado — para
            celebrar una fecha especial o para recordar a alguien.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-muted">
              Todavía no hay mensajes públicos. Sé el primero en dejar uno en
              la página de alguien.
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageCard key={m.id} m={m} forUser={m.owner} index={i} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
