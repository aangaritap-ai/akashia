import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { messageTarget, publicMessages } from "@/lib/feed";
import MessageCard from "@/components/MessageCard";

// Muestra nombres y mensajes de personas: fuera de los buscadores.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// El feed para visitantes. Quien tiene cuenta lo ve dentro de Inicio.
export default async function MemorialFeedPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/inicio");

  const messages = await publicMessages(100);
  const t = await getTranslations("feedPage");

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-xl flex flex-col gap-8">
        <div className="text-center flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-[0.16em] uppercase text-gold">
            {t("eyebrow")}
          </div>
          <h1 className="font-display font-medium text-4xl text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted leading-relaxed">
            {t("intro")}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-muted">
              {t("empty")}
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageCard
                key={m.id}
                m={m}
                author={m.owner}
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
