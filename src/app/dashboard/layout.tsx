import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  // La sesión puede seguir abierta en un equipo de una cuenta ya eliminada.
  const exists = await prisma.user.count({ where: { id: session.user.id } });
  if (!exists) redirect("/login");

  return (
    <main className="flex-1 px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto w-full">{children}</div>
    </main>
  );
}
