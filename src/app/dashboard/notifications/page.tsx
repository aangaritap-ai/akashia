import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NotificationItem from "@/components/NotificationItem";
import ClearNotificationsButton from "@/components/ClearNotificationsButton";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
  if (unreadIds.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: unreadIds } },
      data: { read: true },
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">
          Notificaciones
        </h1>
        {notifications.length > 0 && <ClearNotificationsButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center text-muted">
          Todavía no tienes notificaciones.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              id={n.id}
              title={n.title}
              body={n.body}
              linkUrl={n.linkUrl}
              createdAt={n.createdAt.toISOString()}
              wasUnread={unreadIds.includes(n.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
