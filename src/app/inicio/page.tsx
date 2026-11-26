import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFollowingIds, pendingReceivedCount } from "@/lib/connections";
import { messageTarget, publicMessages } from "@/lib/feed";
import { upcomingDates } from "@/lib/special-dates-db";
import { getVisibleStories } from "@/lib/stories";
import ShortcutsSidebar from "@/components/inicio/ShortcutsSidebar";
import UpcomingEvents from "@/components/inicio/UpcomingEvents";
import MessageCard from "@/components/MessageCard";
import StoriesBar from "@/components/stories/StoriesBar";

export const metadata: Metadata = { title: "Inicio — Akashia" };

const FEED_SIZE = 100;
const MAX_SHORTCUTS = 8;
const personSelect = { id: true, name: true, avatarUrl: true } as const;

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [me, following, pending, unread, storyGroups, events, messages] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: personSelect }),
      getFollowingIds(userId).then((ids) =>
        prisma.user.findMany({
          where: { id: { in: ids } },
          select: personSelect,
          orderBy: { name: "asc" },
          take: MAX_SHORTCUTS,
        })
      ),
      pendingReceivedCount(userId),
      prisma.notification.count({ where: { userId, read: false } }),
      getVisibleStories(userId),
      upcomingDates(userId),
      publicMessages(FEED_SIZE),
    ]);

  if (!me) redirect("/login");

  // En el celular las piezas van en una columna en este orden: historias,
  // fechas y feed. En pantallas anchas se reparten en tres columnas.
  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="sr-only">Inicio</h1>
      <div className="mx-auto w-full max-w-xl lg:max-w-6xl grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_300px] lg:grid-rows-[auto_1fr] gap-6 items-start">
        <aside className="hidden lg:block lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <ShortcutsSidebar
            me={me}
            following={following}
            pendingRequests={pending}
            unreadNotifications={unread}
          />
        </aside>

        <div className="min-w-0 rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm lg:col-start-2 lg:row-start-1">
          <StoriesBar groups={storyGroups} me={me} />
        </div>

        <aside className="min-w-0 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20">
          <UpcomingEvents events={events} />
        </aside>

        <section
          aria-label="Feed de recuerdos"
          className="min-w-0 flex flex-col gap-4 lg:col-start-2 lg:row-start-2"
        >
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-muted">
              Todavía no hay mensajes públicos. Sé el primero en dejar uno en la
              página de alguien.
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageCard
                key={m.id}
                m={m}
                target={messageTarget(m)}
                index={i}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}
