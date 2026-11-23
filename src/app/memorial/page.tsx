import { prisma } from "@/lib/prisma";
import MessageCard from "@/components/MessageCard";

export default async function MemorialFeedPage() {
  const messages = await prisma.memorialMessage.findMany({
    where: { isPublic: true },
    include: { owner: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-12 sm:py-16">
      <div className="w-full max-w-xl flex flex-col gap-8">
        <div className="text-center flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-[0.16em] uppercase text-gold">
            Comunidad
          </div>
          <h1 className="font-display font-medium text-4xl text-foreground">
            Feed de recuerdos
          </h1>
          <p className="text-muted leading-relaxed">
            Mensajes públicos que la comunidad de Akashia ha dejado — para
            celebrar una fecha especial o para recordar a alguien.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-muted">
              Todavía no hay mensajes públicos. Sé el primero en dejar uno en
              la página de alguien.
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageCard key={m.id} m={m} forUser={m.owner} index={i} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
