import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireContact } from "@/lib/require-contact";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/[locale]/dashboard">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  // También cubre la sesión abierta de una cuenta ya eliminada.
  await requireContact(session.user.id);

  return (
    <main className="flex-1 px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto w-full">{children}</div>
    </main>
  );
}
