import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  followRequests,
  getFollowingIds,
  pendingReceivedCount,
} from "@/lib/connections";
import { messageTarget, publicMessages } from "@/lib/feed";
import { upcomingDates } from "@/lib/special-dates-db";
import { getVisibleStories } from "@/lib/stories";
import { requireContact } from "@/lib/require-contact";
import FollowRequests from "@/components/inicio/FollowRequests";
import ShortcutsSidebar from "@/components/inicio/ShortcutsSidebar";
import UpcomingEvents from "@/components/inicio/UpcomingEvents";
import MessageCard from "@/components/MessageCard";
import PostComposer from "@/components/PostComposer";
import StoriesBar from "@/components/stories/StoriesBar";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("home") };
}

const FEED_SIZE = 100;
const MAX_SHORTCUTS = 8;
const MAX_REQUESTS = 2;
const personSelect = { id: true, name: true, avatarUrl: true } as const;

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  await requireContact(userId);

  const [
    me,
    following,
    pending,
    unread,
    storyGroups,
    events,
    messages,
    requests,
  ] = await Promise.all([
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
      followRequests(userId, MAX_REQUESTS),
    ]);

  if (!me) redirect("/login");
  const t = await getTranslations("home");

  // En el celular las piezas van en una columna en este orden: historias,
  // crear publicación, fechas y feed. En pantallas anchas se reparten en tres columnas, y a la
  // derecha aparecen además las solicitudes de seguimiento.
  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="sr-only">{t("title")}</h1>
      <div className="mx-auto w-full max-w-xl lg:max-w-6xl grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_300px] lg:grid-rows-[auto_1fr] gap-6 items-start">
        <aside className="hidden lg:block lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <ShortcutsSidebar
            me={me}
            following={following}
            pendingRequests={pending}
            unreadNotifications={unread}
          />
        </aside>

        <div className="min-w-0 flex flex-col gap-4 lg:col-start-2 lg:row-start-1">
          <div className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm">
            <StoriesBar groups={storyGroups} me={me} />
          </div>
          <PostComposer me={me} />
        </div>

        <aside className="min-w-0 flex flex-col gap-6 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          {requests.length > 0 && (
            <div className="hidden lg:block">
              <FollowRequests requests={requests} />
            </div>
          )}
          <UpcomingEvents events={events} />
        </aside>

        <section
          aria-label={t("feedLabel")}
          className="min-w-0 flex flex-col gap-4 lg:col-start-2 lg:row-start-2"
        >
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-muted">
              {t("emptyFeed")}
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageCard
                key={m.id}
                m={m}
                author={m.owner}
                target={messageTarget(m)}
                index={i}
                canDelete={m.ownerId === userId}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}
