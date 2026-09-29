import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link href="/dashboard" className="font-display text-xl text-foreground">
          Akashia
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5 text-sm text-muted">
          <Link href="/dashboard" className="hover:text-foreground">
            Cápsulas
          </Link>
          <Link href="/dashboard/guardians" className="hover:text-foreground">
            Guardianes
          </Link>
          <Link href="/dashboard/memorial" className="hover:text-foreground">
            Memorial
          </Link>
          <span className="hidden sm:inline text-foreground/70">
            {session.user.name}
          </span>
          <form action={logout}>
            <button type="submit" className="hover:text-foreground">
              Salir
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1 px-4 sm:px-6 py-10">
        <div className="max-w-3xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
