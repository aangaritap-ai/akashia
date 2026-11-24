import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import ConnectButton from "@/components/ConnectButton";
import ConnectionSearch from "@/components/ConnectionSearch";
import { ListCard, PageHeader } from "@/components/ui";
import type { RelationState } from "@/lib/connections";

type Person = { id: string; name: string; avatarUrl: string | null };

function PersonRow({
  person,
  index,
  state,
  connectionId,
}: {
  person: Person;
  index: number;
  state: RelationState;
  connectionId: string;
}) {
  return (
    <ListCard index={index}>
      <Link
        href={`/memorial/${person.id}`}
        className="flex items-center gap-4 min-w-0 hover:underline"
      >
        <Avatar name={person.name} src={person.avatarUrl} size="lg" />
        <span className="font-semibold text-foreground truncate">
          {person.name}
        </span>
      </Link>
      <div className="shrink-0">
        <ConnectButton
          userId={person.id}
          initialState={state}
          initialConnectionId={connectionId}
          allowRemove
        />
      </div>
    </ListCard>
  );
}

export default async function ConnectionsPage() {
  const session = await auth();
  const me = session!.user.id;

  const select = { id: true, name: true, avatarUrl: true } as const;

  const [received, sent, accepted] = await Promise.all([
    prisma.connection.findMany({
      where: { addresseeId: me, status: "PENDING" },
      include: { requester: { select } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.connection.findMany({
      where: { requesterId: me, status: "PENDING" },
      include: { addressee: { select } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: me }, { addresseeId: me }],
      },
      include: { requester: { select }, addressee: { select } },
      orderBy: { respondedAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Conexiones"
        subtitle="Las personas conectadas contigo pueden ver tus historias de 24 horas. Tú decides con quién conectar."
      />

      <ConnectionSearch />

      {received.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display font-medium text-xl text-foreground">
            Solicitudes recibidas
          </h2>
          {received.map((c, i) => (
            <PersonRow
              key={c.id}
              person={c.requester}
              index={i}
              state="received"
              connectionId={c.id}
            />
          ))}
        </section>
      )}

      {sent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display font-medium text-xl text-foreground">
            Solicitudes enviadas
          </h2>
          {sent.map((c, i) => (
            <PersonRow
              key={c.id}
              person={c.addressee}
              index={i}
              state="sent"
              connectionId={c.id}
            />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display font-medium text-xl text-foreground">
          Tus conexiones
          {accepted.length > 0 && (
            <span className="ml-2 text-sm text-muted font-sans">
              {accepted.length}
            </span>
          )}
        </h2>
        {accepted.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-10 text-center text-sm text-muted">
            Todavía no tienes conexiones. Busca a alguien por su nombre para
            empezar.
          </div>
        ) : (
          accepted.map((c, i) => (
            <PersonRow
              key={c.id}
              person={c.requesterId === me ? c.addressee : c.requester}
              index={i}
              state="connected"
              connectionId={c.id}
            />
          ))
        )}
      </section>
    </div>
  );
}
