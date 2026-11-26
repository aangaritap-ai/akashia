import { auth } from "@/lib/auth";
import { listNotifications } from "@/lib/notifications";
import NotificationList from "@/components/notifications/NotificationList";

export default async function NotificationsPage() {
  const session = await auth();
  const items = await listNotifications(session!.user.id, 50);

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-surface px-1 py-4 sm:px-3 shadow-sm">
      <NotificationList initial={items} />
    </div>
  );
}
