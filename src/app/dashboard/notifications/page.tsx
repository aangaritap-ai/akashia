import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      <h1 className="font-display text-2xl text-foreground">
        Notificaciones
      </h1>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center text-muted">
          Todavía no tienes notificaciones.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const wasUnread = unreadIds.includes(n.id);
            const content = (
              <div
                className={`rounded-xl border px-5 py-4 shadow-sm ${
                  wasUnread
                    ? "border-accent/30 bg-accent/[0.06]"
                    : "border-border bg-surface"
                }`}
              >
                <div className="font-semibold text-foreground">
                  {n.title}
                </div>
                <div className="text-sm text-muted mt-1">{n.body}</div>
                <div className="text-xs text-muted mt-2">
                  {new Date(n.createdAt).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
            return n.linkUrl ? (
              <Link key={n.id} href={n.linkUrl}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
