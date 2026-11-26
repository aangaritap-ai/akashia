import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { messageTarget, publicMessages } from "@/lib/feed";
import MessageCard from "@/components/MessageCard";

// El feed para visitantes. Quien tiene cuenta lo ve dentro de Inicio.
export default async function MemorialFeedPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/inicio");

  const messages = await publicMessages(100);

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10">
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
              <MessageCard
                key={m.id}
                m={m}
                target={messageTarget(m)}
                index={i}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
