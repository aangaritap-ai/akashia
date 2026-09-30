import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MemorialMessageForm from "@/components/MemorialMessageForm";

export default async function MemorialPage({
  params,
}: PageProps<"/memorial/[userId]">) {
  const { userId } = await params;

  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      memorialMessages: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!owner) notFound();

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-20">
      <div className="w-full max-w-xl flex flex-col gap-10">
        <div className="text-center flex flex-col gap-3">
          <Link href="/" className="font-display text-lg text-muted">
            Akashia
          </Link>
          <h1 className="font-display font-medium text-4xl text-foreground">
            En memoria de {owner.name}
          </h1>
          <p className="text-muted">
            Un espacio para recordar, agradecer y dejar un mensaje.
          </p>
        </div>

        <MemorialMessageForm userId={owner.id} />

        <div className="flex flex-col gap-4">
          {owner.memorialMessages.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface px-6 py-10 text-center text-muted">
              Sé el primero en dejar un mensaje.
            </div>
          ) : (
            owner.memorialMessages.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border bg-surface px-5 py-4 shadow-sm"
              >
                {m.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.imageUrl}
                    alt=""
                    className="w-full max-h-96 object-cover rounded-lg mb-3"
                  />
                )}
                <div className="text-sm whitespace-pre-line text-foreground">
                  {m.message}
                </div>
                <div className="text-xs text-muted mt-3 flex items-center gap-2">
                  <span>
                    — {m.authorName} ·{" "}
                    {new Date(m.createdAt).toLocaleDateString("es")}
                  </span>
                  {!m.isPublic && (
                    <span className="rounded-full bg-black/5 px-2 py-0.5">
                      Privado
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
