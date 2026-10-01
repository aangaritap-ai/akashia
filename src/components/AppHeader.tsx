import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/DashboardNav";
import NavHistoryButtons from "@/components/NavHistoryButtons";
import { IconBell, IconLogout } from "@/components/icons";

export default async function AppHeader() {
  const session = await auth();

  if (!session?.user) {
    return (
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-3 sm:px-6 py-2.5 flex items-center gap-3">
        <NavHistoryButtons />
        <Link
          href="/"
          className="font-display text-lg text-foreground shrink-0"
        >
          Akashia
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2 shrink-0 text-sm">
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg text-muted hover:text-foreground hover:bg-black/[0.04]"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="px-3 py-1.5 rounded-lg bg-accent text-background font-semibold hover:brightness-110"
          >
            Crear cuenta
          </Link>
        </div>
      </header>
    );
  }

  const [unreadCount, me] = await Promise.all([
    prisma.notification.count({
      where: { userId: session.user.id, read: false },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { name: true, avatarUrl: true },
    }),
  ]);

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const initial = me.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="px-3 sm:px-6 py-2.5 flex items-center gap-3">
        <NavHistoryButtons />

        <Link
          href="/dashboard"
          className="font-display text-lg text-foreground shrink-0"
        >
          Akashia
        </Link>

        <div className="flex-1 min-w-0 hidden sm:flex justify-center">
          <DashboardNav />
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <Link
            href="/dashboard/notifications"
            aria-label="Notificaciones"
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-black/[0.04]"
          >
            <IconBell />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] rounded-full bg-accent text-background text-[9px] font-semibold flex items-center justify-center px-0.5">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/profile"
            aria-label="Tu perfil"
            className="w-9 h-9 rounded-full overflow-hidden border border-border shrink-0"
          >
            {me.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={me.avatarUrl}
                alt={me.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-accent/15 text-accent flex items-center justify-center font-display text-sm">
                {initial}
              </div>
            )}
          </Link>

          <form action={logout}>
            <button
              type="submit"
              aria-label="Salir"
              className="w-9 h-9 flex items-center justify-center rounded-full text-muted hover:text-red-600 hover:bg-black/[0.04]"
            >
              <IconLogout />
            </button>
          </form>
        </div>
      </div>

      <div className="sm:hidden border-t border-border px-2 py-1 flex justify-around">
        <DashboardNav />
      </div>
    </header>
  );
}
