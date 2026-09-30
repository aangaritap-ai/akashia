import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MemorialFeedPage() {
  const messages = await prisma.memorialMessage.findMany({
    where: { isPublic: true },
    include: { owner: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-20">
      <div className="w-full max-w-xl flex flex-col gap-10">
        <div className="text-center flex flex-col gap-3">
          <Link href="/" className="font-display text-lg text-muted">
            Akashia
          </Link>
          <h1 className="font-display font-medium text-4xl text-foreground">
            Feed de recuerdos
          </h1>
          <p className="text-muted">
            Mensajes públicos que la comunidad de Akashia ha dejado para sus
            seres queridos.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center text-muted">
              Todavía no hay mensajes públicos. Sé el primero en dejar uno en
              el memorial de alguien.
            </div>
          ) : (
            messages.map((m) => (
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
                <div className="text-xs text-muted mt-3">
                  — {m.authorName}, para{" "}
                  <Link
                    href={`/memorial/${m.owner.id}`}
                    className="text-accent"
                  >
                    {m.owner.name}
                  </Link>{" "}
                  · {new Date(m.createdAt).toLocaleDateString("es")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
