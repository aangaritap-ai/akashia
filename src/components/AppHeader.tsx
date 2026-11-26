import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/DashboardNav";
import NavHistoryButtons from "@/components/NavHistoryButtons";
import NotificationBell from "@/components/notifications/NotificationBell";
import { IconLogout } from "@/components/icons";
import { Logo } from "@/components/Logo";

export default async function AppHeader() {
  const session = await auth();
  // Si la base está despertando, el encabezado no debe tumbar la página. Y una
  // cuenta eliminada en otro equipo se muestra como sin sesión.
  const data = session?.user
    ? await Promise.all([
        prisma.notification.count({
          where: { userId: session.user.id, read: false },
        }),
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, avatarUrl: true },
        }),
      ]).catch(() => null)
    : null;
  const me = data?.[1];

  if (!data || !me) {
    return (
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-3 sm:px-6 py-2.5 flex items-center gap-3">
        <NavHistoryButtons />
        <Link href="/" className="text-foreground shrink-0">
          <Logo markClassName="w-7 h-7" />
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

  const unreadCount = data[0];

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const initial = me.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="px-3 sm:px-6 py-2.5 flex items-center gap-3">
        <NavHistoryButtons />

        <Link href="/inicio" className="text-foreground shrink-0">
          <Logo markClassName="w-7 h-7" />
        </Link>

        <div className="flex-1 min-w-0 hidden lg:flex justify-center">
          <DashboardNav />
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
          <NotificationBell unread={unreadCount} />

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

      <div className="lg:hidden border-t border-border px-2 py-1 flex justify-around">
        <DashboardNav />
      </div>
    </header>
  );
}
