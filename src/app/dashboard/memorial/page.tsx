import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CopyLinkButton from "@/components/CopyLinkButton";

export default async function MemorialSettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const messages = await prisma.memorialMessage.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  const url = `${process.env.APP_URL || "http://localhost:3000"}/memorial/${userId}`;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-foreground">Tu memorial</h1>
        <p className="text-sm text-muted mt-2 max-w-lg">
          Un espacio público donde tu familia y amigos pueden dejarte
          mensajes y recuerdos, hoy o después de que faltes. Comparte este
          enlace con quien quieras.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
        <code className="text-sm text-muted truncate">{url}</code>
        <CopyLinkButton url={url} />
      </div>

      <div className="flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center text-muted">
            Todavía nadie ha dejado un mensaje. Comparte tu enlace.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-border bg-surface px-5 py-4 shadow-sm"
            >
              <div className="text-sm whitespace-pre-line text-foreground">
                {m.message}
              </div>
              <div className="text-xs text-muted mt-3">
                — {m.authorName} ·{" "}
                {new Date(m.createdAt).toLocaleDateString("es")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
